import { createHmac, timingSafeEqual } from "node:crypto";

export const DONATION_CURRENCY = "INR";

export function expectedPaise(amountInRupees: number) {
  return amountInRupees * 100;
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, secret: string) {
  if (!secret || !signature || !rawBody) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string,
) {
  if (!keySecret || !signature || !orderId || !paymentId) return false;
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type WebhookEventStatus = "received" | "processed" | "ignored" | "failed";

export function webhookEventDisposition(existing: { status: string } | null) {
  if (!existing) return "process" as const;
  if (existing.status === "processed" || existing.status === "ignored") return "skip" as const;
  return "retry" as const;
}

export type LocalDonation = {
  id: number;
  status: string;
  amount: number;
  currency: string;
  paymentId: string;
  paymentOrderId: string;
  campaignId: number;
  organizationId: number;
};

export type GatewayPayment = {
  id: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  captured: boolean;
};

export type CompleteDecision =
  | { action: "idempotent" }
  | { action: "complete" }
  | { action: "reject"; reason: string };

export function decidePaymentCompletion(input: {
  donation: LocalDonation | null;
  payment: GatewayPayment;
  paymentAlreadyOnDonationId: number | null;
  claimed?: Pick<LocalDonation, "id" | "campaignId" | "organizationId"> | null;
}): CompleteDecision {
  const { donation, payment, paymentAlreadyOnDonationId, claimed } = input;
  if (!donation) return { action: "reject", reason: "unknown_donation" };
  if (!payment.id || !payment.orderId) return { action: "reject", reason: "missing_payment" };
  if (!donation.paymentOrderId) return { action: "reject", reason: "missing_order" };
  if (donation.paymentOrderId !== payment.orderId) {
    return { action: "reject", reason: "order_mismatch" };
  }
  if (!donation.campaignId || !donation.organizationId) {
    return { action: "reject", reason: "missing_tenant" };
  }
  if (
    claimed &&
    (claimed.id !== donation.id ||
      claimed.campaignId !== donation.campaignId ||
      claimed.organizationId !== donation.organizationId)
  ) {
    return { action: "reject", reason: "tenant_mismatch" };
  }
  if (paymentAlreadyOnDonationId != null && paymentAlreadyOnDonationId !== donation.id) {
    return { action: "reject", reason: "payment_id_reused" };
  }
  if (!Number.isInteger(payment.amountPaise) || payment.amountPaise <= 0) {
    return { action: "reject", reason: "amount_mismatch" };
  }
  if (payment.amountPaise !== expectedPaise(donation.amount)) {
    return { action: "reject", reason: "amount_mismatch" };
  }
  const currency = (payment.currency || DONATION_CURRENCY).toUpperCase();
  const localCurrency = (donation.currency || DONATION_CURRENCY).toUpperCase();
  if (currency !== localCurrency) {
    return { action: "reject", reason: "currency_mismatch" };
  }
  if (!payment.captured) {
    return { action: "reject", reason: "not_captured" };
  }
  if (donation.status === "completed") {
    if (donation.paymentId === payment.id) return { action: "idempotent" };
    return { action: "reject", reason: "already_completed" };
  }
  if (donation.status === "sandbox") {
    return { action: "reject", reason: "sandbox_donation" };
  }
  return { action: "complete" };
}

export function parseCapturedPayment(payload: unknown): {
  eventId: string;
  eventType: string;
  payment: GatewayPayment | null;
} | { error: string } {
  if (!payload || typeof payload !== "object") return { error: "invalid_payload" };
  const body = payload as Record<string, unknown>;
  const eventId = String(body.id ?? "").trim();
  const eventType = String(body.event ?? "").trim();
  if (!eventId) return { error: "missing_event_id" };
  if (eventType !== "payment.captured") {
    return { eventId, eventType, payment: null };
  }
  const nested = body.payload as Record<string, unknown> | undefined;
  const paymentWrap = nested?.payment as Record<string, unknown> | undefined;
  const entity = (paymentWrap?.entity ?? nested?.entity ?? body.entity) as Record<string, unknown> | undefined;
  if (!entity || typeof entity !== "object") {
    return { eventId, eventType, payment: null };
  }
  const status = String(entity.status ?? "").toLowerCase();
  const captured = entity.captured === true || status === "captured";
  return {
    eventId,
    eventType,
    payment: {
      id: String(entity.id ?? ""),
      orderId: String(entity.order_id ?? ""),
      amountPaise: Number(entity.amount),
      currency: String(entity.currency ?? DONATION_CURRENCY),
      captured,
    },
  };
}
