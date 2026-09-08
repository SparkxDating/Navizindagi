const PUBLIC_RECEIPT_KEYS = [
  "referenceId",
  "campaignTitle",
  "campaignSlug",
  "amount",
  "currency",
  "status",
  "createdAt",
] as const;

export type PublicDonationReceipt = {
  referenceId: string;
  campaignTitle: string;
  campaignSlug: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "sandbox";
  createdAt: string;
};

const BLOCKED_KEYS = [
  "email",
  "phone",
  "donorName",
  "donor_name",
  "message",
  "address",
  "donorEmail",
  "donorPhone",
] as const;

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function num(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function receiptStatus(value: unknown): PublicDonationReceipt["status"] {
  const status = text(value);
  if (status === "completed" || status === "failed" || status === "sandbox") return status;
  return "pending";
}

export function toPublicReceipt(row: Record<string, unknown> | null | undefined): PublicDonationReceipt | null {
  if (!row) return null;
  const referenceId = text(row.reference_id ?? row.referenceId).trim();
  if (!referenceId) return null;
  return {
    referenceId,
    campaignTitle: text(row.campaign_title ?? row.campaignTitle),
    campaignSlug: text(row.campaign_slug ?? row.campaignSlug),
    amount: num(row.amount),
    currency: text(row.currency) || "INR",
    status: receiptStatus(row.status),
    createdAt: text(row.created_at ?? row.createdAt),
  };
}

export function publicReceiptKeys() {
  return PUBLIC_RECEIPT_KEYS;
}

export function publicReceiptContainsPii(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return BLOCKED_KEYS.some((key) => Object.prototype.hasOwnProperty.call(record, key) && record[key] != null && record[key] !== "");
}
