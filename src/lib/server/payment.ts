import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  donationSchema,
  sandboxCompleteSchema,
  verifyPaymentSchema,
} from "@/lib/schemas";
import type { PaymentConfig } from "@/lib/types";
import { sanitizeMultiline, sanitizePlainText } from "@/lib/utils";
import { mapDonation } from "./mappers";
import { getRequestIp, rateLimit } from "./rate-limit";

/**
 * Payment gateway credentials — server only.
 * TODO: set these in the host environment (never VITE_ / never frontend):
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 * Until both are present the site stays in labelled sandbox mode and does not
 * collect live payments.
 */
function razorpayKeys() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim() ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() ?? "";
  return { keyId, keySecret };
}

function paymentMode(): PaymentConfig {
  const { keyId, keySecret } = razorpayKeys();
  if (keyId && keySecret) {
    return { mode: "razorpay", publicKey: keyId };
  }
  return { mode: "sandbox", publicKey: null };
}

function makeReferenceId() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NZF-${Date.now().toString(36).toUpperCase()}-${rand}`;
}

function razorpayAuthHeader() {
  const { keyId, keySecret } = razorpayKeys();
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayGet<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    headers: { Authorization: razorpayAuthHeader() },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `The payment gateway could not confirm this payment. ${detail.slice(0, 160) || "Please try again."}`,
    );
  }
  return (await response.json()) as T;
}

function expectedPaise(amountInRupees: number) {
  return amountInRupees * 100;
}

export const getPaymentConfig = createServerFn({ method: "GET" }).handler(async () => {
  return paymentMode();
});

export const createDonation = createServerFn({ method: "POST" })
  .validator(donationSchema)
  .handler(async ({ data }) => {
    if (data.website) {
      return {
        status: "ignored" as const,
        referenceId: "",
        mode: "sandbox" as const,
        orderId: null,
        publicKey: null,
        amount: 0,
        campaignTitle: "",
      };
    }
    const ip = await getRequestIp();
    if (!rateLimit(`donate:${ip}`, 8, 15 * 60 * 1000)) {
      throw new Error("Too many donation attempts. Please try again later.");
    }

    const sql = await getSql();
    const campaigns = await sql`select id, title, slug, is_active from campaigns where slug = ${data.campaignSlug}`;
    const campaign = campaigns[0] as
      | { id: number; title: string; slug: string; is_active: boolean }
      | undefined;
    if (!campaign || !campaign.is_active) {
      throw new Error("That campaign is not available.");
    }

    const referenceId = makeReferenceId();
    const config = paymentMode();
    const provider = config.mode === "razorpay" ? "razorpay" : "sandbox";

    await sql.query(
      `insert into donations
        (campaign_id, donor_name, email, phone, amount, currency, message, is_anonymous, status, payment_provider, reference_id)
       values ($1,$2,$3,$4,$5,'INR',$6,$7,'pending',$8,$9)`,
      [
        campaign.id,
        sanitizePlainText(data.donorName, 120),
        sanitizePlainText(data.email, 200),
        sanitizePlainText(data.phone, 20),
        data.amount,
        sanitizeMultiline(data.message ?? "", 1000),
        data.anonymous,
        provider,
        referenceId,
      ],
    );

    if (config.mode === "razorpay") {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: razorpayAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: expectedPaise(data.amount),
          currency: "INR",
          receipt: referenceId,
          notes: {
            campaign: campaign.slug,
            referenceId,
          },
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        await sql`update donations set status = 'failed', updated_at = now() where reference_id = ${referenceId}`;
        throw new Error(
          `The payment gateway could not create an order. ${detail.slice(0, 180) || "Please try again."}`,
        );
      }
      const order = (await response.json()) as { id?: string };
      if (!order.id) {
        await sql`update donations set status = 'failed', updated_at = now() where reference_id = ${referenceId}`;
        throw new Error("The payment gateway did not return an order id.");
      }
      await sql`update donations set payment_order_id = ${order.id}, updated_at = now() where reference_id = ${referenceId}`;
      return {
        status: "pending" as const,
        referenceId,
        mode: "razorpay" as const,
        orderId: order.id,
        publicKey: config.publicKey,
        amount: data.amount,
        campaignTitle: campaign.title,
      };
    }

    return {
      status: "pending" as const,
      referenceId,
      mode: "sandbox" as const,
      orderId: null,
      publicKey: null,
      amount: data.amount,
      campaignTitle: campaign.title,
    };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .validator(verifyPaymentSchema)
  .handler(async ({ data }) => {
    const ip = await getRequestIp();
    if (!rateLimit(`verify:${ip}`, 20, 15 * 60 * 1000)) {
      throw new Error("Too many verification attempts. Please try again later.");
    }
    const { keyId, keySecret } = razorpayKeys();
    if (!keyId || !keySecret) {
      throw new Error("Live payment verification is not configured.");
    }
    const { createHmac, timingSafeEqual } = await import("node:crypto");
    const payload = `${data.razorpayOrderId}|${data.razorpayPaymentId}`;
    const expected = createHmac("sha256", keySecret).update(payload).digest("hex");
    const left = Buffer.from(expected);
    const right = Buffer.from(data.razorpaySignature);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      throw new Error("Payment signature could not be verified.");
    }

    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `select d.*, c.title as campaign_title, c.slug as campaign_slug
       from donations d join campaigns c on c.id = d.campaign_id
       where d.reference_id = $1`,
      [data.referenceId],
    );
    const donation = rows[0] ? mapDonation(rows[0]) : null;
    if (!donation) throw new Error("Donation record not found.");
    if (donation.status === "completed" && donation.paymentId === data.razorpayPaymentId) {
      return { ok: true as const, referenceId: data.referenceId };
    }
    if (donation.status === "completed") {
      throw new Error("This donation was already verified.");
    }
    if (!donation.paymentOrderId) {
      throw new Error("This donation has no gateway order to verify.");
    }
    if (donation.paymentOrderId !== data.razorpayOrderId) {
      throw new Error("Order id does not match this donation.");
    }

    const payment = await razorpayGet<{
      id?: string;
      order_id?: string;
      amount?: number;
      currency?: string;
      status?: string;
      captured?: boolean;
    }>(`/payments/${encodeURIComponent(data.razorpayPaymentId)}`);

    if (!payment.id || payment.id !== data.razorpayPaymentId) {
      throw new Error("Gateway payment id could not be confirmed.");
    }
    if (payment.order_id !== donation.paymentOrderId) {
      throw new Error("Payment does not belong to the expected order.");
    }
    if (payment.amount !== expectedPaise(donation.amount)) {
      throw new Error("Verified payment amount does not match this donation.");
    }
    if ((payment.currency ?? "INR").toUpperCase() !== "INR") {
      throw new Error("Verified payment currency does not match this donation.");
    }
    const paymentStatus = (payment.status ?? "").toLowerCase();
    if (paymentStatus !== "captured" && payment.captured !== true) {
      throw new Error("Payment is not in a captured state.");
    }

    const order = await razorpayGet<{
      id?: string;
      amount?: number;
      amount_paid?: number;
      currency?: string;
      status?: string;
    }>(`/orders/${encodeURIComponent(donation.paymentOrderId)}`);

    if (!order.id || order.id !== donation.paymentOrderId) {
      throw new Error("Gateway order could not be confirmed.");
    }
    if (order.amount !== expectedPaise(donation.amount)) {
      throw new Error("Verified order amount does not match this donation.");
    }
    if ((order.status ?? "").toLowerCase() !== "paid") {
      throw new Error("Gateway order is not marked paid.");
    }

    const updated = await sql.query<{ id: number }>(
      `update donations
       set status = 'completed',
           payment_id = $1,
           payment_order_id = $2,
           updated_at = now()
       where reference_id = $3
         and status in ('pending','failed')
         and payment_order_id = $2
         and amount = $4
       returning id`,
      [data.razorpayPaymentId, data.razorpayOrderId, data.referenceId, donation.amount],
    );
    if (!updated[0]) {
      throw new Error("Donation could not be marked successful after verification.");
    }

    return { ok: true as const, referenceId: data.referenceId };
  });

export const completeSandboxDonation = createServerFn({ method: "POST" })
  .validator(sandboxCompleteSchema)
  .handler(async ({ data }) => {
    if (paymentMode().mode !== "sandbox") {
      throw new Error("Sandbox completion is disabled while a live gateway is configured.");
    }
    const sql = await getSql();
    const rows = await sql`select status, payment_provider from donations where reference_id = ${data.referenceId}`;
    const current = rows[0] as { status?: string; payment_provider?: string } | undefined;
    if (!current) throw new Error("Donation record not found.");
    if (current.payment_provider && current.payment_provider !== "sandbox") {
      throw new Error("This donation is not a sandbox payment.");
    }
    if (current.status === "completed" || current.status === "sandbox") {
      return { ok: true as const, referenceId: data.referenceId };
    }
    await sql`update donations set status = 'sandbox', updated_at = now() where reference_id = ${data.referenceId} and payment_provider = 'sandbox'`;
    return { ok: true as const, referenceId: data.referenceId };
  });
