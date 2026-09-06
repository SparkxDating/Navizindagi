import { getSql } from "@/lib/db";
import {
  parseCapturedPayment,
  verifyRazorpayWebhookSignature,
  webhookEventDisposition,
} from "./razorpay-complete";
import { completeCapturedPayment } from "./payment";

function webhookSecret() {
  return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() ?? "";
}

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function handleRazorpayWebhook(request: Request) {
  const secret = webhookSecret();
  if (!secret) {
    return jsonResponse(503, { ok: false, error: "webhook_unconfigured" });
  }
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!verifyRazorpayWebhookSignature(rawBody, signature, secret)) {
    return jsonResponse(400, { ok: false, error: "invalid_signature" });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    return jsonResponse(400, { ok: false, error: "invalid_json" });
  }

  const extracted = parseCapturedPayment(parsed);
  if ("error" in extracted) {
    return jsonResponse(400, { ok: false, error: extracted.error });
  }

  const sql = await getSql();
  const existing = await sql.query<{ status: string }>(
    `select status from payment_webhook_events where event_id = $1`,
    [extracted.eventId],
  );
  const disposition = webhookEventDisposition(existing[0] ?? null);
  if (disposition === "skip") {
    return jsonResponse(200, { ok: true, idempotent: true });
  }

  const inserted = await sql.query<{ id: number }>(
    `insert into payment_webhook_events (event_id, event_type, status, payment_id, order_id)
     values ($1, $2, 'received', $3, $4)
     on conflict (event_id) do nothing
     returning id`,
    [
      extracted.eventId,
      extracted.eventType,
      extracted.payment?.id ?? "",
      extracted.payment?.orderId ?? "",
    ],
  );
  if (!inserted[0] && disposition !== "retry") {
    return jsonResponse(200, { ok: true, idempotent: true });
  }

  if (!extracted.payment) {
    await sql.query(
      `update payment_webhook_events
       set status = 'ignored', processed_at = now(), updated_at = now()
       where event_id = $1`,
      [extracted.eventId],
    );
    return jsonResponse(200, { ok: true, ignored: true });
  }

  try {
    await completeCapturedPayment(extracted.payment);
    await sql.query(
      `update payment_webhook_events
       set status = 'processed', processed_at = now(), updated_at = now(), error_message = ''
       where event_id = $1`,
      [extracted.eventId],
    );
    return jsonResponse(200, { ok: true });
  } catch {
    await sql.query(
      `update payment_webhook_events
       set status = 'failed', updated_at = now(), error_message = 'apply_failed'
       where event_id = $1`,
      [extracted.eventId],
    );
    return jsonResponse(422, { ok: false, error: "not_applied" });
  }
}
