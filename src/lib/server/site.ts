import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  enquirySchema,
  referenceSchema,
  slugSchema,
  volunteerSchema,
} from "@/lib/schemas";
import { toPublicReceipt } from "@/lib/public-receipt";
import type { Campaign, SiteSettings } from "@/lib/types";
import { sanitizeMultiline, sanitizePlainText } from "@/lib/utils";
import {
  CAMPAIGN_SELECT,
  mapCampaign,
  mapFaq,
  mapReport,
  mapSettings,
  mapTeam,
  mapUpdate,
} from "./mappers";
import { getRequestIp, rateLimit } from "./rate-limit";

async function loadSettings(): Promise<SiteSettings> {
  const sql = await getSql();
  const rows = await sql<Record<string, unknown>>`select * from ngo_settings where id = 1`;
  const row = rows[0];
  if (!row) {
    throw new Error("NGO settings are not initialised");
  }
  return mapSettings(row);
}

async function loadCampaigns(activeOnly = true): Promise<Campaign[]> {
  const sql = await getSql();
  const rows = activeOnly
    ? await sql.query<Record<string, unknown>>(
        `select ${CAMPAIGN_SELECT} from campaigns c where c.is_active = true and c.status = 'active' order by c.sort_order, c.id`,
      )
    : await sql.query<Record<string, unknown>>(
        `select ${CAMPAIGN_SELECT} from campaigns c order by c.sort_order, c.id`,
      );
  return rows.map(mapCampaign);
}

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  return loadSettings();
});

export const getPublicSite = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const [settings, campaigns, faqs, reports, team, updates] = await Promise.all([
    loadSettings(),
    loadCampaigns(true),
    sql`select * from faqs where is_published = true order by sort_order, id`,
    sql`select * from reports where published_at is not null order by published_at desc, id desc`,
    sql`select * from team_members order by sort_order, id`,
    sql.query<Record<string, unknown>>(
      `select u.*, c.title as campaign_title, c.slug as campaign_slug
       from campaign_updates u
       join campaigns c on c.id = u.campaign_id
       where u.published_at is not null
       order by u.published_at desc, u.id desc
       limit 8`,
    ),
  ]);
  return {
    settings,
    campaigns,
    faqs: faqs.map(mapFaq),
    reports: reports.map(mapReport),
    team: team.map(mapTeam),
    updates: updates.map(mapUpdate),
  };
});

export const getCampaignPage = createServerFn({ method: "GET" })
  .validator(slugSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [settings, rows] = await Promise.all([
      loadSettings(),
      sql.query<Record<string, unknown>>(
        `select ${CAMPAIGN_SELECT} from campaigns c where c.slug = $1 and c.is_active = true and c.status = 'active'`,
        [data.slug],
      ),
    ]);
    const campaign = rows[0] ? mapCampaign(rows[0]) : null;
    if (!campaign) return { settings, campaign: null, updates: [], campaigns: [] };
    const [updates, campaigns] = await Promise.all([
      sql`select * from campaign_updates where campaign_id = ${campaign.id} and published_at is not null order by published_at desc, id desc`,
      loadCampaigns(true),
    ]);
    return {
      settings,
      campaign,
      updates: updates.map(mapUpdate),
      campaigns,
    };
  });

export const getDonationReceipt = createServerFn({ method: "GET" })
  .validator(referenceSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      `select d.reference_id, d.amount, d.currency, d.status, d.created_at,
              c.title as campaign_title, c.slug as campaign_slug
       from donations d
       join campaigns c on c.id = d.campaign_id
       where d.reference_id = $1`,
      [data.referenceId],
    );
    const donation = toPublicReceipt(rows[0] ?? null);
    const settings = await loadSettings();
    return {
      donation,
      settings: settings
        ? { orgName: settings.orgName, tagline: settings.tagline }
        : null,
    };
  });

export const submitVolunteer = createServerFn({ method: "POST" })
  .validator(volunteerSchema)
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    const ip = await getRequestIp();
    if (!rateLimit(`volunteer:${ip}`, 5, 15 * 60 * 1000)) {
      throw new Error("Too many submissions. Please try again later.");
    }
    const sql = await getSql();
    await sql.query(
      `insert into volunteers
        (full_name, email, phone, city, state_country, areas_of_interest, availability, skills, message, consent, organization_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,(select id from organizations where slug = 'navi-zindagi-foundation' limit 1))`,
      [
        sanitizePlainText(data.fullName, 120),
        sanitizePlainText(data.email, 200),
        sanitizePlainText(data.phone, 20),
        sanitizePlainText(data.city, 80),
        sanitizePlainText(data.stateCountry, 80),
        JSON.stringify(data.areasOfInterest.map((item) => sanitizePlainText(item, 80))),
        sanitizePlainText(data.availability, 80),
        sanitizePlainText(data.skills ?? "", 500),
        sanitizeMultiline(data.message ?? "", 1000),
        true,
      ],
    );
    return { ok: true as const };
  });

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(enquirySchema)
  .handler(async ({ data }) => {
    if (data.website) return { ok: true as const };
    const ip = await getRequestIp();
    if (!rateLimit(`enquiry:${ip}`, 6, 15 * 60 * 1000)) {
      throw new Error("Too many messages. Please try again later.");
    }
    const sql = await getSql();
    await sql.query(
      `insert into contact_enquiries (name, email, phone, subject, message, organization_id)
       values ($1,$2,$3,$4,$5,(select id from organizations where slug = 'navi-zindagi-foundation' limit 1))`,
      [sanitizePlainText(data.name, 120), sanitizePlainText(data.email, 200), sanitizePlainText(data.phone ?? "", 20), sanitizePlainText(data.subject, 160), sanitizeMultiline(data.message, 2000)],
    );
    return { ok: true as const };
  });
