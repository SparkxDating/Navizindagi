import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  donationSchema,
  sandboxCompleteSchema,
  verifyPaymentSchema,
} from "@/lib/schemas";
import type { PaymentConfig } from "@/lib/types";
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
        data.donorName,
        data.email,
        data.phone,
        data.amount,
        data.message ?? "",
        data.anonymous,
        provider,
        referenceId,
      ],
    );

    if (config.mode === "razorpay") {
      const { keyId, keySecret } = razorpayKeys();
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.amount * 100,
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
    const { keySecret } = razorpayKeys();
    if (!keySecret) {
      throw new Error("Live payment verification is not configured.");
    }
    const { createHmac, timingSafeEqual } = await import("node:crypto");
    const payload = `${data.razorpayOrderId}|${data.razorpayPaymentId}`;
    const expected = createHmac("sha256", keySecret).update(payload).digest("hex");
    const left = Buffer.from(expected);
    const right = Buffer.from(data.razorpaySignature);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      const sql = await getSql();
      await sql`update donations set status = 'failed', updated_at = now() where reference_id = ${data.referenceId}`;
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
    if (donation.paymentOrderId && donation.paymentOrderId !== data.razorpayOrderId) {
      throw new Error("Order id does not match this donation.");
    }

    await sql.query(
      `update donations
       set status = 'completed',
           payment_id = $1,
           payment_order_id = $2,
           updated_at = now()
       where reference_id = $3 and status in ('pending','failed')`,
      [data.razorpayPaymentId, data.razorpayOrderId, data.referenceId],
    );

    return { ok: true as const, referenceId: data.referenceId };
  });

export const completeSandboxDonation = createServerFn({ method: "POST" })
  .validator(sandboxCompleteSchema)
  .handler(async ({ data }) => {
    if (paymentMode().mode !== "sandbox") {
      throw new Error("Sandbox completion is disabled while a live gateway is configured.");
    }
    const sql = await getSql();
    const rows = await sql`select status from donations where reference_id = ${data.referenceId}`;
    const current = rows[0] as { status?: string } | undefined;
    if (!current) throw new Error("Donation record not found.");
    if (current.status === "completed" || current.status === "sandbox") {
      return { ok: true as const, referenceId: data.referenceId };
    }
    await sql`update donations set status = 'sandbox', updated_at = now() where reference_id = ${data.referenceId}`;
    return { ok: true as const, referenceId: data.referenceId };
  });
