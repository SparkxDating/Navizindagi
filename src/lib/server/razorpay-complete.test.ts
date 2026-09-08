import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHmac } from "node:crypto";
import {
  decidePaymentCompletion,
  expectedPaise,
  parseCapturedPayment,
  verifyRazorpayWebhookSignature,
  webhookEventDisposition,
  type GatewayPayment,
  type LocalDonation,
} from "./razorpay-complete.ts";

const secret = "whsec_test_secret";

function sign(body: string) {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function donation(overrides: Partial<LocalDonation> = {}): LocalDonation {
  return {
    id: 10,
    status: "pending",
    amount: 500,
    currency: "INR",
    paymentId: "",
    paymentOrderId: "order_abc",
    campaignId: 7,
    organizationId: 3,
    ...overrides,
  };
}

function payment(overrides: Partial<GatewayPayment> = {}): GatewayPayment {
  return {
    id: "pay_abc",
    orderId: "order_abc",
    amountPaise: expectedPaise(500),
    currency: "INR",
    captured: true,
    ...overrides,
  };
}

describe("razorpay webhook signature", () => {
  it("accepts a valid signature over the raw body", () => {
    const raw = '{"id":"evt_1","event":"payment.captured"}';
    assert.equal(verifyRazorpayWebhookSignature(raw, sign(raw), secret), true);
  });

  it("rejects an invalid signature", () => {
    const raw = '{"id":"evt_1","event":"payment.captured"}';
    assert.equal(verifyRazorpayWebhookSignature(raw, "deadbeef", secret), false);
    assert.equal(verifyRazorpayWebhookSignature(JSON.stringify(JSON.parse(raw)), sign(raw + " "), secret), false);
  });
});

describe("webhook event idempotency", () => {
  it("processes a new event once and skips repeats", () => {
    assert.equal(webhookEventDisposition(null), "process");
    assert.equal(webhookEventDisposition({ status: "processed" }), "skip");
    assert.equal(webhookEventDisposition({ status: "ignored" }), "skip");
    assert.equal(webhookEventDisposition({ status: "received" }), "retry");
    assert.equal(webhookEventDisposition({ status: "failed" }), "retry");
  });

  it("retries a received event because the previous attempt may have crashed before completion", () => {
    assert.equal(webhookEventDisposition({ status: "received" }), "retry");
  });
});

describe("payment completion decisions", () => {
  it("does not let the same payment id complete two donations", () => {
    const decision = decidePaymentCompletion({
      donation: donation({ id: 11 }),
      payment: payment(),
      paymentAlreadyOnDonationId: 10,
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "payment_id_reused");
  });

  it("does not mark paid on amount mismatch", () => {
    const decision = decidePaymentCompletion({
      donation: donation(),
      payment: payment({ amountPaise: expectedPaise(999) }),
      paymentAlreadyOnDonationId: null,
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "amount_mismatch");
  });

  it("does not mark paid on currency mismatch", () => {
    const decision = decidePaymentCompletion({
      donation: donation(),
      payment: payment({ currency: "USD" }),
      paymentAlreadyOnDonationId: null,
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "currency_mismatch");
  });

  it("treats an already-paid matching donation as idempotent", () => {
    const decision = decidePaymentCompletion({
      donation: donation({ status: "completed", paymentId: "pay_abc" }),
      payment: payment(),
      paymentAlreadyOnDonationId: 10,
    });
    assert.equal(decision.action, "idempotent");
  });

  it("rejects attaching a payment to an unrelated order/donation", () => {
    const decision = decidePaymentCompletion({
      donation: donation({ paymentOrderId: "order_other" }),
      payment: payment({ orderId: "order_abc" }),
      paymentAlreadyOnDonationId: null,
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "order_mismatch");
  });

  it("preserves organization and campaign on a valid completion", () => {
    const local = donation({ campaignId: 7, organizationId: 3 });
    const decision = decidePaymentCompletion({
      donation: local,
      payment: payment(),
      paymentAlreadyOnDonationId: null,
    });
    assert.equal(decision.action, "complete");
    assert.equal(local.organizationId, 3);
    assert.equal(local.campaignId, 7);
  });

  it("does not complete when the donation record is missing", () => {
    const decision = decidePaymentCompletion({
      donation: null,
      payment: payment(),
      paymentAlreadyOnDonationId: null,
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "unknown_donation");
  });

  it("does not attach a payment to a donation belonging to an unrelated campaign or organization", () => {
    const foreignDonation = donation({
      id: 99,
      campaignId: 88,
      organizationId: 2,
      paymentOrderId: "order_abc",
    });
    const decision = decidePaymentCompletion({
      donation: foreignDonation,
      payment: payment({ orderId: "order_abc" }),
      paymentAlreadyOnDonationId: null,
      claimed: { id: 10, campaignId: 7, organizationId: 3 },
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "tenant_mismatch");
  });

  it("does not complete a donation that is missing campaign or organization", () => {
    const decision = decidePaymentCompletion({
      donation: donation({ organizationId: 0 }),
      payment: payment(),
      paymentAlreadyOnDonationId: null,
    });
    assert.equal(decision.action, "reject");
    if (decision.action === "reject") assert.equal(decision.reason, "missing_tenant");
  });

  it("completes when the claimed donation is the same campaign and organization", () => {
    const local = donation({ id: 10, campaignId: 7, organizationId: 3 });
    const decision = decidePaymentCompletion({
      donation: local,
      payment: payment(),
      paymentAlreadyOnDonationId: null,
      claimed: { id: 10, campaignId: 7, organizationId: 3 },
    });
    assert.equal(decision.action, "complete");
  });
});

describe("webhook payload parsing", () => {
  it("extracts a captured payment from a Razorpay event", () => {
    const parsed = parseCapturedPayment({
      id: "evt_1",
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_abc",
            order_id: "order_abc",
            amount: 50000,
            currency: "INR",
            status: "captured",
            captured: true,
          },
        },
      },
    });
    assert.equal("error" in parsed, false);
    if ("error" in parsed) return;
    assert.equal(parsed.eventId, "evt_1");
    assert.equal(parsed.payment?.id, "pay_abc");
    assert.equal(parsed.payment?.amountPaise, 50000);
  });
});
