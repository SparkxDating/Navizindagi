-- Navi Zindagi Foundation public + admin schema
create table if not exists ngo_settings (
  id integer primary key default 1,
  org_name text not null,
  tagline text not null,
  about_text text not null default '',
  mission text not null default '',
  vision text not null default '',
  values_text text not null default '',
  areas_of_work text not null default '',
  address text not null default '',
  phone text not null default '',
  email text not null default '',
  whatsapp text not null default '',
  facebook_url text not null default '',
  instagram_url text not null default '',
  twitter_url text not null default '',
  maps_embed_url text not null default '',
  registration_cin text not null default '',
  registration_notes text not null default 'To be updated',
  how_donations_used text not null default '',
  payment_info text not null default '',
  updated_at timestamptz not null default now(),
  constraint ngo_settings_single_row check (id = 1)
);

create table if not exists campaigns (
  id serial primary key,
  slug text not null unique,
  title text not null,
  location_label text not null,
  country_code text not null default '',
  hero_image_url text not null default '',
  short_description text not null default '',
  situation_text text not null default '',
  mission_text text not null default '',
  relief_priorities text not null default '[]',
  utilisation_notes text not null default 'Campaign-wise utilisation will be published here as reports are available.',
  target_amount integer not null default 0,
  manual_amount_raised integer not null default 0,
  manual_donor_count integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists donations (
  id serial primary key,
  campaign_id integer not null references campaigns(id),
  donor_name text not null,
  email text not null,
  phone text not null default '',
  amount integer not null,
  currency text not null default 'INR',
  message text not null default '',
  is_anonymous boolean not null default false,
  status text not null default 'pending',
  payment_provider text not null default '',
  payment_order_id text not null default '',
  payment_id text not null default '',
  reference_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donations_amount_positive check (amount > 0),
  constraint donations_status_check check (status in ('pending', 'completed', 'failed', 'sandbox'))
);

create index if not exists donations_campaign_idx on donations (campaign_id);
create index if not exists donations_status_idx on donations (status);
create index if not exists donations_email_idx on donations (email);

create table if not exists volunteers (
  id serial primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  state_country text not null,
  areas_of_interest text not null default '[]',
  availability text not null default '',
  skills text not null default '',
  message text not null default '',
  consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists contact_enquiries (
  id serial primary key,
  name text not null,
  email text not null,
  phone text not null default '',
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists campaign_updates (
  id serial primary key,
  campaign_id integer not null references campaigns(id) on delete cascade,
  title text not null,
  body text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists campaign_updates_campaign_idx on campaign_updates (campaign_id);

create table if not exists reports (
  id serial primary key,
  title text not null,
  description text not null default '',
  url text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  id serial primary key,
  name text not null,
  role text not null default 'To be updated',
  bio text not null default 'To be updated',
  photo_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists faqs (
  id serial primary key,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true
);

create table if not exists admin_users (
  user_id text primary key,
  email text not null default '',
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

insert into ngo_settings (
  id, org_name, tagline, about_text, mission, vision, values_text, areas_of_work,
  address, phone, email, whatsapp, facebook_url, instagram_url, twitter_url,
  maps_embed_url, registration_cin, registration_notes, how_donations_used, payment_info
) values (
  1,
  'Navi Zindagi Foundation',
  'Empower. Elevate. Transform.',
  'Navi Zindagi Foundation is a registered Indian non-governmental organisation working towards sustainable development in health, education, nutrition and environment. This website is dedicated to flood-relief fundraising and volunteer mobilisation for families affected in Nepal and Assam. Operational claims on this site are limited to information the Foundation has confirmed and published through the admin area.',
  'To channel compassion into accountable support — raising funds and volunteer capacity for verified flood-relief needs, while continuing the Foundation''s broader work in health, education, nutrition and environment.',
  'Communities recovering from disaster with dignity, and a society in which every person can live a navi zindagi — a renewed life — with access to care, learning and opportunity.',
  'Dignity. Transparency. Compassion. Accountability. Do not over-claim. Publish what is verified; label what is still to be updated.',
  'Flood relief fundraising and volunteer mobilisation; health; education; nutrition; environment. Programme details beyond this flood-relief appeal will be published as they are confirmed.',
  '132, A-2 Block, First Floor, Main Market, Rajouri Garden, New Delhi, Delhi 110027, India',
  '+91 85956 12015',
  'navizindagifoundation@gmail.com',
  '+91 85956 12015',
  'https://www.facebook.com/navizindagifoundation/',
  '',
  '',
  '',
  'U85300DL2021NPL382367',
  'Public company-registry details are listed where confirmed. 12A, 80G, FCRA and other tax-exemption or certification information: To be updated. Do not assume tax deductibility until certificates are published here.',
  'Donations to this appeal are intended for flood-relief support — food, clean water, hygiene supplies, medical support, temporary shelter and essential household items — for Nepal Flood Relief, Assam Flood Relief, or general relief as chosen by the donor. Exact allocation is published as utilisation reports become available. Until a report is posted, treat figures as ""To be updated"".',
  'Online donations are processed through a payment gateway (Razorpay when credentials are configured). Card and UPI details are handled by the gateway and are not stored on this website. Until gateway credentials are added on the server, the site runs in labelled sandbox mode and no real money is collected.'
) on conflict (id) do nothing;

insert into campaigns (
  slug, title, location_label, country_code, hero_image_url, short_description,
  situation_text, mission_text, relief_priorities, utilisation_notes,
  target_amount, is_featured, is_active, sort_order
) values
(
  'nepal-flood-relief',
  'Nepal Flood Relief',
  'Nepal',
  'NP',
  '/campaign-nepal.jpg',
  'Support verified flood-relief efforts for families affected by monsoon flooding in Nepal.',
  'Monsoon flooding in Nepal has damaged homes, roads and access to clean water across multiple districts. Navi Zindagi Foundation is raising funds so contributions can be directed to verified relief needs. This page does not claim that the Foundation is physically operating in a named location until that is documented here. Situation details and field reports will be published as they are confirmed.',
  'Channel donor support toward food, clean water, hygiene supplies, medical assistance, temporary shelter and essential household items for flood-affected families in Nepal, through verified relief channels. Updates will appear on this page as they are verified — not before.',
  '["Food kits","Clean water","Hygiene supplies","Medical support","Temporary shelter","Essential household items"]',
  'Nepal Flood Relief utilisation: To be updated. Campaign-wise spend will be published when reports are available.',
  0, true, true, 1
),
(
  'assam-flood-relief',
  'Assam Flood Relief',
  'Assam, India',
  'IN',
  '/campaign-assam.jpg',
  'Support verified flood-relief efforts for families affected by flooding in Assam.',
  'Seasonal flooding in Assam regularly inundates riverine communities, damaging homes, farmland and access to safe water. Navi Zindagi Foundation is raising funds so contributions can be directed to verified relief needs in Assam. We will not claim on-the-ground operations or beneficiary counts until those facts are published through this page.',
  'Direct donor support to verified needs — food, clean water, hygiene, medical care, temporary shelter and essential supplies — for flood-affected families in Assam. Fundraising targets and utilisation notes are maintained by the Foundation and can be updated from the admin dashboard.',
  '["Food kits","Clean water","Hygiene supplies","Medical support","Temporary shelter","Essential household items"]',
  'Assam Flood Relief utilisation: To be updated. Campaign-wise spend will be published when reports are available.',
  0, true, true, 2
),
(
  'general-relief',
  'General Relief',
  'Where the need is most urgent',
  '',
  '/hero-banner.jpg',
  'An unrestricted flood-relief fund so the Foundation can allocate support to the most urgent verified need.',
  'General Relief is for donors who wish to support flood-affected families without restricting funds to a single geography. The Foundation will allocate these gifts to verified Nepal or Assam relief needs, or related essential support, and will publish that allocation when reports are available.',
  'Provide flexible funding for verified flood-relief priorities — food, water, hygiene, medical support, shelter and essentials — wherever the confirmed need is greatest.',
  '["Food kits","Clean water","Hygiene supplies","Medical support","Temporary shelter","Essential household items"]',
  'General Relief utilisation: To be updated.',
  0, false, true, 3
)
on conflict (slug) do nothing;

insert into campaign_updates (campaign_id, title, body, published_at)
select id,
  'Campaign page opened',
  'This campaign page is live. Situation reports, volunteer notes and utilisation figures will be published here as they are verified. Until then, treat operational statistics as ""To be updated"".',
  now()
from campaigns
where slug in ('nepal-flood-relief', 'assam-flood-relief')
  and not exists (select 1 from campaign_updates);

insert into faqs (question, answer, sort_order) values
(
  'How are donations used?',
  'Donations are intended for flood-relief support: food, clean water, hygiene supplies, medical support, temporary shelter and essential household items. You may choose Nepal Flood Relief, Assam Flood Relief, or General Relief. Detailed utilisation is published on the Transparency page as reports become available.',
  1
),
(
  'Will I receive a donation receipt?',
  'After a verified payment you can view, download and print a donation acknowledgement from the thank-you page. Tax-exemption certificates (such as 80G) are listed only when the Foundation has published them. Until then, treat tax deductibility as ""To be updated"".',
  2
),
(
  'Is this website collecting real payments yet?',
  'Real charges happen only through the configured payment gateway after server-side verification. If gateway credentials are not yet added, the site clearly labels sandbox/test mode and does not collect live payments.',
  3
),
(
  'Does Navi Zindagi Foundation operate in every flood-affected location named here?',
  'Not necessarily. This appeal raises funds and volunteer capacity for verified flood-relief efforts. The Foundation will not claim it is physically present in a location until that is documented in an official update.',
  4
),
(
  'How can I volunteer?',
  'Use the volunteer form to share your skills, city and availability. A team member will follow up using the contact details you provide. Submitting the form is not a guarantee of placement.',
  5
);
