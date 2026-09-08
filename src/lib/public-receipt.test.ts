import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  publicReceiptContainsPii,
  publicReceiptKeys,
  toPublicReceipt,
} from "./public-receipt.ts";

const fullRow = {
  id: 42,
  campaign_id: 7,
  campaign_title: "Nepal Flood Relief",
  campaign_slug: "nepal-flood-relief",
  donor_name: "Priya Sharma",
  email: "priya@example.com",
  phone: "9876543210",
  amount: 500,
  currency: "INR",
  message: "Please keep this private",
  is_anonymous: false,
  status: "completed",
  payment_provider: "razorpay",
  payment_order_id: "order_secret",
  payment_id: "pay_secret",
  reference_id: "NZF-TEST-RECEIPT",
  created_at: "2026-09-08T12:00:00.000Z",
};

describe("public donation receipt privacy", () => {
  it("does not return donor email from public receipt access", () => {
    const receipt = toPublicReceipt(fullRow);
    assert.ok(receipt);
    assert.equal("email" in receipt, false);
    assert.equal(JSON.stringify(receipt).includes("priya@example.com"), false);
  });

  it("does not return donor phone, name, or address from public receipt access", () => {
    const receipt = toPublicReceipt({
      ...fullRow,
      address: "132 Rajouri Garden",
      donorPhone: "9876543210",
    });
    assert.ok(receipt);
    assert.equal(publicReceiptContainsPii(receipt), false);
    assert.equal(JSON.stringify(receipt).includes("9876543210"), false);
    assert.equal(JSON.stringify(receipt).includes("Priya Sharma"), false);
    assert.equal(JSON.stringify(receipt).includes("Rajouri Garden"), false);
  });

  it("returns only the intended safe public fields", () => {
    const receipt = toPublicReceipt(fullRow);
    assert.ok(receipt);
    assert.deepEqual(Object.keys(receipt).sort(), [...publicReceiptKeys()].sort());
    assert.equal(receipt.referenceId, "NZF-TEST-RECEIPT");
    assert.equal(receipt.campaignTitle, "Nepal Flood Relief");
    assert.equal(receipt.amount, 500);
    assert.equal(receipt.currency, "INR");
    assert.equal(receipt.status, "completed");
    assert.equal(receipt.createdAt, "2026-09-08T12:00:00.000Z");
  });

  it("keeps donor PII out of the public allowlist used by getDonationReceipt", () => {
    const keys: readonly string[] = publicReceiptKeys();
    assert.equal(keys.includes("email"), false);
    assert.equal(keys.includes("phone"), false);
    assert.equal(keys.includes("donorName"), false);
    assert.equal(keys.includes("message"), false);
  });

  it("still works for a valid successful donation receipt", () => {
    const receipt = toPublicReceipt(fullRow);
    assert.ok(receipt);
    assert.equal(receipt.status, "completed");
    assert.equal(receipt.amount, 500);
    assert.equal(receipt.referenceId, "NZF-TEST-RECEIPT");
    assert.equal(receipt.campaignSlug, "nepal-flood-relief");
  });

  it("handles an invalid or missing reference safely", () => {
    assert.equal(toPublicReceipt(null), null);
    assert.equal(toPublicReceipt(undefined), null);
    assert.equal(toPublicReceipt({ amount: 500, email: "hidden@example.com" }), null);
  });
});
