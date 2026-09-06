-- Phase 1: crowdfunding foundation (organizations, fundraisers, attribution).
-- Additive only. Existing campaigns, donations, auth, and admin tables stay.

create table if not exists organizations (
  id serial primary key,
  name text not null,
  slug text not null unique,
  description text not null default '',
  logo_url text not null default '',
  website_url text not null default '',
  email text not null default '',
  phone text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_status_check check (status in ('active', 'suspended', 'pending'))
);



insert into organizations (name, slug, description, email, phone, status)
select org_name, 'navi-zindagi-foundation', about_text, email, phone, 'active'
from ngo_settings
where id = 1
  and not exists (select 1 from organizations where slug = 'navi-zindagi-foundation');

insert into organizations (name, slug, status)
select 'Navi Zindagi Foundation', 'navi-zindagi-foundation', 'active'
where not exists (select 1 from organizations where slug = 'navi-zindagi-foundation');

create table if not exists organization_members (
  id serial primary key,
  organization_id integer not null references organizations(id) on delete cascade,
  user_id text not null references "user"("id") on delete cascade,
  role text not null default 'viewer',
  created_at timestamptz not null default now(),
  constraint organization_members_role_check check (role in ('owner', 'admin', 'campaign_manager', 'viewer')),
  constraint organization_members_org_user_uidx unique (organization_id, user_id)
);

create index if not exists organization_members_user_idx on organization_members (user_id);

alter table campaigns add column if not exists organization_id integer references organizations(id);
alter table campaigns add column if not exists created_by text references "user"("id") on delete set null;
alter table campaigns add column if not exists status text not null default 'active';
alter table campaigns add column if not exists category text not null default '';
alter table campaigns add column if not exists start_at timestamptz;
alter table campaigns add column if not exists end_at timestamptz;
alter table campaigns add column if not exists beneficiary_name text not null default '';
alter table campaigns add column if not exists video_url text not null default '';
alter table campaigns add column if not exists allow_fundraisers boolean not null default false;
alter table campaigns add column if not exists allow_recurring boolean not null default false;

update campaigns
set organization_id = (select id from organizations where slug = 'navi-zindagi-foundation' limit 1)
where organization_id is null;

alter table campaigns alter column organization_id set not null;

update campaigns
set status = case when is_active then 'active' else 'paused' end
where status is null or status = 'active' and is_active = false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'campaigns_status_check'
  ) then
    alter table campaigns
      add constraint campaigns_status_check
      check (status in ('draft', 'pending_review', 'active', 'paused', 'completed', 'rejected'));
  end if;
end $$;

create index if not exists campaigns_organization_idx on campaigns (organization_id);
create index if not exists campaigns_status_idx on campaigns (status);
create index if not exists campaigns_created_by_idx on campaigns (created_by);

create table if not exists fundraisers (
  id serial primary key,
  campaign_id integer not null references campaigns(id) on delete cascade,
  user_id text not null references "user"("id") on delete cascade,
  display_name text not null,
  slug text not null,
  bio text not null default '',
  avatar_url text not null default '',
  goal_amount integer not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fundraisers_status_check check (status in ('pending', 'active', 'paused', 'completed')),
  constraint fundraisers_goal_nonnegative check (goal_amount >= 0),
  constraint fundraisers_campaign_slug_uidx unique (campaign_id, slug)
);

create unique index if not exists fundraisers_open_user_campaign_uidx
  on fundraisers (campaign_id, user_id)
  where status in ('pending', 'active');

create index if not exists fundraisers_campaign_idx on fundraisers (campaign_id);
create index if not exists fundraisers_user_idx on fundraisers (user_id);

create table if not exists referral_links (
  id serial primary key,
  campaign_id integer not null references campaigns(id) on delete cascade,
  fundraiser_id integer references fundraisers(id) on delete set null,
  code text not null,
  destination_url text not null default '',
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint referral_links_code_key unique (code),
  constraint referral_links_click_nonnegative check (click_count >= 0)
);

create index if not exists referral_links_fundraiser_idx on referral_links (fundraiser_id);
create index if not exists referral_links_campaign_idx on referral_links (campaign_id);

create table if not exists campaign_visitors (
  id serial primary key,
  campaign_id integer not null references campaigns(id) on delete cascade,
  fundraiser_id integer references fundraisers(id) on delete set null,
  referral_link_id integer references referral_links(id) on delete set null,
  session_id text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_content text not null default '',
  landing_page text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists campaign_visitors_campaign_idx on campaign_visitors (campaign_id);
create index if not exists campaign_visitors_fundraiser_idx on campaign_visitors (fundraiser_id);

alter table donations add column if not exists fundraiser_id integer references fundraisers(id) on delete set null;
alter table donations add column if not exists referral_link_id integer references referral_links(id) on delete set null;
alter table donations add column if not exists utm_source text;
alter table donations add column if not exists utm_medium text;
alter table donations add column if not exists utm_campaign text;
alter table donations add column if not exists utm_content text;

create index if not exists donations_fundraiser_idx on donations (fundraiser_id);

create table if not exists donation_attribution (
  id serial primary key,
  donation_id integer not null references donations(id) on delete cascade,
  campaign_id integer not null references campaigns(id) on delete cascade,
  fundraiser_id integer references fundraisers(id) on delete set null,
  referral_link_id integer references referral_links(id) on delete set null,
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  utm_content text not null default '',
  attribution_type text not null default 'direct',
  created_at timestamptz not null default now(),
  constraint donation_attribution_type_check check (attribution_type in ('direct', 'referral', 'social', 'utm')),
  constraint donation_attribution_donation_key unique (donation_id)
);

create index if not exists donation_attribution_fundraiser_idx on donation_attribution (fundraiser_id);

create table if not exists campaign_media (
  id serial primary key,
  campaign_id integer not null references campaigns(id) on delete cascade,
  type text not null,
  url text not null,
  thumbnail_url text not null default '',
  title text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint campaign_media_type_check check (type in ('image', 'video', 'document'))
);

create index if not exists campaign_media_campaign_idx on campaign_media (campaign_id);

create table if not exists campaign_milestones (
  id serial primary key,
  campaign_id integer not null references campaigns(id) on delete cascade,
  amount integer not null,
  title text not null,
  description text not null default '',
  reached_at timestamptz,
  created_at timestamptz not null default now(),
  constraint campaign_milestones_amount_positive check (amount > 0)
);

create index if not exists campaign_milestones_campaign_idx on campaign_milestones (campaign_id);

create table if not exists notifications (
  id serial primary key,
  user_id text not null references "user"("id") on delete cascade,
  type text not null,
  title text not null,
  message text not null default '',
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (user_id);

create table if not exists receipts (
  id serial primary key,
  donation_id integer not null references donations(id) on delete cascade,
  receipt_number text not null,
  receipt_url text not null default '',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint receipts_number_key unique (receipt_number)
);

create unique index if not exists receipts_donation_uidx on receipts (donation_id);

create table if not exists audit_logs (
  id serial primary key,
  user_id text references "user"("id") on delete set null,
  organization_id integer references organizations(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_org_idx on audit_logs (organization_id);
create index if not exists audit_logs_user_idx on audit_logs (user_id);
