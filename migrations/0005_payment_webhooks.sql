-- Phase 2: Razorpay webhook idempotency and unique payment identifiers.
-- Additive. Empty payment ids stay allowed so pending/sandbox rows are valid.

create table if not exists payment_webhook_events (
  id serial primary key,
  event_id text not null,
  event_type text not null default '',
  status text not null default 'received',
  error_message text not null default '',
  payment_id text not null default '',
  order_id text not null default '',
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_webhook_events_event_id_key unique (event_id),
  constraint payment_webhook_events_status_check
    check (status in ('received', 'processed', 'ignored', 'failed'))
);

create unique index if not exists donations_payment_id_uidx
  on donations (payment_id)
  where payment_id is not null and payment_id <> '';

create unique index if not exists donations_payment_order_id_uidx
  on donations (payment_order_id)
  where payment_order_id is not null and payment_order_id <> '';
