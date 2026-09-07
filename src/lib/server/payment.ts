import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  donationSchema,
  sandboxCompleteSchema,
  verifyPaymentSchema,
} from "@/lib/schemas";
import type { PaymentConfig } from "@/lib/types";
import { sanitizeMultiline, sanitizePlainText } from "@/lib/utils";
import { mapDonation, num, text } from "./mappers";
import { getRequestIp, rateLimit } from "./rate-limit";
import {
  decidePaymentCompletion,
  expectedPaise,
  verifyCheckoutSignature,
  type GatewayPayment,
  type LocalDonation,
} from "./razorpay-complete";

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
    throw new Error("The payment gateway could not confirm this payment. Please try again.");
  }
  return (await response.json()) as T;
}

export { expectedPaise };

function toLocalDonation(row: Record<string, unknown>): LocalDonation {
  return {
    id: num(row.id),
    status: text(row.status),
    amount: num(row.amount),
    currency: text(row.currency) || "INR",
    paymentId: text(row.payment_id ?? row.paymentId),
    paymentOrderId: text(row.payment_order_id ?? row.paymentOrderId),
    campaignId: num(row.campaign_id ?? row.campaignId),
    organizationId: num(row.organization_id ?? row.organizationId),
  };
}

async function donationByOrderId(orderId: string) {
  const sql = await getSql();
  const rows = await sql.query<Record<string, unknown>>(
    `select d.*, c.title as campaign_title, c.slug as campaign_slug, c.organization_id
     from donations d
     join campaigns c on c.id = d.campaign_id
     where d.payment_order_id = $1`,
    [orderId],
  );
  return rows.length === 1 ? rows[0] : null;
}

async function paymentOwnerId(paymentId: string) {
  if (!paymentId) return null;
  const sql = await getSql();
  const rows = await sql.query<{ id: number }>(
    `select id from donations where payment_id = $1 and payment_id <> '' limit 1`,
    [paymentId],
  );
  return rows[0]?.id ?? null;
}

export async function completeCapturedPayment(
  payment: GatewayPayment,
  claimed?: Pick<LocalDonation, "id" | "campaignId" | "organizationId"> | null,
) {
  const sql = await getSql();
  const row = await donationByOrderId(payment.orderId);
  const donation = row ? toLocalDonation(row) : null;
  const owner = await paymentOwnerId(payment.id);
  const decision = decidePaymentCompletion({
    donation,
    payment,
    paymentAlreadyOnDonationId: owner,
    claimed: claimed ?? null,
  });
  if (decision.action === "reject") {
    throw new Error("Payment could not be applied to this donation.");
  }
  if (decision.action === "idempotent" || !donation) {
    return { ok: true as const, referenceId: text(row?.reference_id), idempotent: true as const };
  }
  const updated = await sql.query<{ id: number; reference_id: string }>(
    `update donations
     set status = 'completed',
         payment_id = $1,
         payment_order_id = $2,
         updated_at = now()
     where id = $3
       and campaign_id = $4
       and payment_order_id = $2
       and amount = $5
       and status in ('pending','failed')
       and (payment_id = '' or payment_id = $1)
       and exists (
         select 1 from campaigns c
         where c.id = donations.campaign_id
           and c.id = $4
           and c.organization_id = $6
       )
     returning id, reference_id`,
    [payment.id, payment.orderId, donation.id, donation.campaignId, donation.amount, donation.organizationId],
  );
  if (!updated[0]) {
    const again = await donationByOrderId(payment.orderId);
    const current = again ? toLocalDonation(again) : null;
    if (current?.status === "completed" && current.paymentId === payment.id) {
      return { ok: true as const, referenceId: text(again?.reference_id), idempotent: true as const };
    }
    throw new Error("Donation could not be marked successful after verification.");
  }
  return { ok: true as const, referenceId: updated[0].reference_id, idempotent: false as const };
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
    const campaigns = await sql`select id, title, slug, is_active, status from campaigns where slug = ${data.campaignSlug}`;
    const campaign = campaigns[0] as
      | { id: number; title: string; slug: string; is_active: boolean; status: string }
      | undefined;
    if (!campaign || !campaign.is_active || campaign.status !== "active") {
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
        await sql`update donations set status = 'failed', updated_at = now() where reference_id = ${referenceId}`;
        throw new Error("The payment gateway could not create an order. Please try again.");
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
    if (
      !verifyCheckoutSignature(
        data.razorpayOrderId,
        data.razorpayPaymentId,
        data.razorpaySignature,
        keySecret,
      )
    ) {
      throw new Error("Payment signature could not be verified.");
    }

    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `select d.*, c.title as campaign_title, c.slug as campaign_slug, c.organization_id
       from donations d join campaigns c on c.id = d.campaign_id
       where d.reference_id = $1`,
      [data.referenceId],
    );
    const donation = rows[0] ? mapDonation(rows[0]) : null;
    const claimed = rows[0] ? toLocalDonation(rows[0]) : null;
    if (!donation || !claimed) throw new Error("Donation record not found.");
    if (donation.status === "completed" && donation.paymentId === data.razorpayPaymentId) {
      return { ok: true as const, referenceId: data.referenceId };
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
    if (String(payment.order_id ?? "") !== donation.paymentOrderId) {
      throw new Error("Gateway payment does not belong to this donation order.");
    }
    if (String(payment.order_id ?? "") !== data.razorpayOrderId) {
      throw new Error("Gateway payment does not belong to this donation order.");
    }

    const order = await razorpayGet<{
      id?: string;
      amount?: number;
      currency?: string;
      status?: string;
    }>(`/orders/${encodeURIComponent(donation.paymentOrderId)}`);

    if (!order.id || order.id !== donation.paymentOrderId) {
      throw new Error("Gateway order could not be confirmed.");
    }
    if ((order.status ?? "").toLowerCase() !== "paid") {
      throw new Error("Gateway order is not marked paid.");
    }

    const result = await completeCapturedPayment(
      {
        id: payment.id,
        orderId: String(payment.order_id ?? ""),
        amountPaise: Number(payment.amount),
        currency: String(payment.currency ?? "INR"),
        captured: payment.captured === true || (payment.status ?? "").toLowerCase() === "captured",
      },
      claimed,
    );
    return { ok: true as const, referenceId: result.referenceId || data.referenceId };
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
