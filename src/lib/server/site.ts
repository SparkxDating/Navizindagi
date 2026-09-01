import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  enquirySchema,
  referenceSchema,
  slugSchema,
  volunteerSchema,
} from "@/lib/schemas";
import type { Campaign, SiteSettings } from "@/lib/types";
import {
  CAMPAIGN_SELECT,
  mapCampaign,
  mapDonation,
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
        `select ${CAMPAIGN_SELECT} from campaigns c where c.is_active = true order by c.sort_order, c.id`,
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
  const [settings, campaigns, faqs, reports, team] = await Promise.all([
    loadSettings(),
    loadCampaigns(true),
    sql`select * from faqs where is_published = true order by sort_order, id`,
    sql`select * from reports where published_at is not null order by published_at desc, id desc`,
    sql`select * from team_members order by sort_order, id`,
  ]);
  return {
    settings,
    campaigns,
    faqs: faqs.map(mapFaq),
    reports: reports.map(mapReport),
    team: team.map(mapTeam),
  };
});

export const getCampaignPage = createServerFn({ method: "GET" })
  .validator(slugSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [settings, rows] = await Promise.all([
      loadSettings(),
      sql.query<Record<string, unknown>>(
        `select ${CAMPAIGN_SELECT} from campaigns c where c.slug = $1 and c.is_active = true`,
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
      `select d.*, c.title as campaign_title, c.slug as campaign_slug
       from donations d
       join campaigns c on c.id = d.campaign_id
       where d.reference_id = $1`,
      [data.referenceId],
    );
    const donation = rows[0] ? mapDonation(rows[0]) : null;
    const settings = await loadSettings();
    return { donation, settings };
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
        (full_name, email, phone, city, state_country, areas_of_interest, availability, skills, message, consent)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        data.fullName,
        data.email,
        data.phone,
        data.city,
        data.stateCountry,
        JSON.stringify(data.areasOfInterest),
        data.availability,
        data.skills ?? "",
        data.message ?? "",
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
      `insert into contact_enquiries (name, email, phone, subject, message)
       values ($1,$2,$3,$4,$5)`,
      [data.name, data.email, data.phone ?? "", data.subject, data.message],
    );
    return { ok: true as const };
  });
