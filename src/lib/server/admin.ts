import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  campaignInputSchema,
  faqInputSchema,
  idSchema,
  reportInputSchema,
  settingsInputSchema,
  teamInputSchema,
  updateInputSchema,
} from "@/lib/schemas";
import type { DashboardStats } from "@/lib/types";
import { parseStringList } from "@/lib/utils";
import {
  assertCampaignInWorkspace,
  assertPermission,
  resolveWorkspace,
  type Workspace,
} from "./access";
import {
  CAMPAIGN_SELECT,
  mapCampaign,
  mapDonation,
  mapEnquiry,
  mapFaq,
  mapReport,
  mapSettings,
  mapTeam,
  mapUpdate,
  mapVolunteer,
  num,
} from "./mappers";

function workspacePayload(workspace: Workspace) {
  return {
    userId: workspace.userId,
    isAdmin: true as const,
    isPlatformAdmin: workspace.isPlatformAdmin,
    organizationId: workspace.organizationId,
    organizationName: workspace.organizationName,
    organizationSlug: workspace.organizationSlug,
    role: workspace.isPlatformAdmin ? ("platform_admin" as const) : workspace.role,
    permissions: workspace.permissions,
  };
}

export const getAdminContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    return workspacePayload(workspace);
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    const sql = await getSql();
    const orgId = workspace.organizationId;
    const allOrgs = workspace.isPlatformAdmin;
    const showInbox = workspace.permissions.viewInbox;
    const [totals, campaigns, recentDonations, recentVolunteers, recentEnquiries] =
      await Promise.all([
        sql.query<{
          donation_total: unknown;
          completed_count: unknown;
          sandbox_count: unknown;
          pending_count: unknown;
        }>(
          allOrgs
            ? `select
                 coalesce(sum(d.amount) filter (where d.status = 'completed'), 0)::int as donation_total,
                 count(*) filter (where d.status = 'completed')::int as completed_count,
                 count(*) filter (where d.status = 'sandbox')::int as sandbox_count,
                 count(*) filter (where d.status = 'pending')::int as pending_count
               from donations d`
            : `select
                 coalesce(sum(d.amount) filter (where d.status = 'completed'), 0)::int as donation_total,
                 count(*) filter (where d.status = 'completed')::int as completed_count,
                 count(*) filter (where d.status = 'sandbox')::int as sandbox_count,
                 count(*) filter (where d.status = 'pending')::int as pending_count
               from donations d
               join campaigns c on c.id = d.campaign_id
               where c.organization_id = $1`,
          allOrgs ? [] : [orgId],
        ),
        sql.query<Record<string, unknown>>(
          allOrgs
            ? `select ${CAMPAIGN_SELECT} from campaigns c order by c.sort_order, c.id`
            : `select ${CAMPAIGN_SELECT} from campaigns c where c.organization_id = $1 order by c.sort_order, c.id`,
          allOrgs ? [] : [orgId],
        ),
        sql.query<Record<string, unknown>>(
          allOrgs
            ? `select d.*, c.title as campaign_title, c.slug as campaign_slug
               from donations d join campaigns c on c.id = d.campaign_id
               order by d.created_at desc limit 8`
            : `select d.*, c.title as campaign_title, c.slug as campaign_slug
               from donations d join campaigns c on c.id = d.campaign_id
               where c.organization_id = $1
               order by d.created_at desc limit 8`,
          allOrgs ? [] : [orgId],
        ),
        showInbox
          ? allOrgs
            ? sql`select * from volunteers order by created_at desc limit 6`
            : sql`select * from volunteers where organization_id = ${orgId} order by created_at desc limit 6`
          : Promise.resolve([]),
        showInbox
          ? allOrgs
            ? sql`select * from contact_enquiries order by created_at desc limit 6`
            : sql`select * from contact_enquiries where organization_id = ${orgId} order by created_at desc limit 6`
          : Promise.resolve([]),
      ]);
    const volunteerCount = showInbox
      ? await sql.query<{ n: unknown }>(
          allOrgs
            ? `select count(*)::int as n from volunteers`
            : `select count(*)::int as n from volunteers where organization_id = $1`,
          allOrgs ? [] : [orgId],
        )
      : [{ n: 0 }];
    const enquiryCount = showInbox
      ? await sql.query<{ n: unknown }>(
          allOrgs
            ? `select count(*)::int as n from contact_enquiries`
            : `select count(*)::int as n from contact_enquiries where organization_id = $1`,
          allOrgs ? [] : [orgId],
        )
      : [{ n: 0 }];
    const row = totals[0];
    const mappedCampaigns = campaigns.map(mapCampaign);
    const stats: DashboardStats = {
      donationTotal: num(row?.donation_total),
      completedDonationCount: num(row?.completed_count),
      sandboxDonationCount: num(row?.sandbox_count),
      pendingDonationCount: num(row?.pending_count),
      volunteerCount: num(volunteerCount[0]?.n),
      enquiryCount: num(enquiryCount[0]?.n),
      campaignCount: mappedCampaigns.length,
      campaigns: mappedCampaigns.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        amountRaised: campaign.amountRaised,
        targetAmount: campaign.targetAmount,
        donorCount: campaign.donorCount,
      })),
    };
    return {
      stats,
      recentDonations: recentDonations.map(mapDonation),
      recentVolunteers: recentVolunteers.map(mapVolunteer),
      recentEnquiries: recentEnquiries.map(mapEnquiry),
    };
  });

export const listAdminCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "viewCampaigns");
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      workspace.isPlatformAdmin
        ? `select ${CAMPAIGN_SELECT} from campaigns c order by c.sort_order, c.id`
        : `select ${CAMPAIGN_SELECT} from campaigns c where c.organization_id = $1 order by c.sort_order, c.id`,
      workspace.isPlatformAdmin ? [] : [workspace.organizationId],
    );
    return rows.map(mapCampaign);
  });

export const saveCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(campaignInputSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "writeCampaigns");
    const sql = await getSql();
    const priorities = JSON.stringify(parseStringList(data.reliefPriorities));
    const countryCode = data.countryCode ?? "";
    const hero = data.heroImageUrl ?? "";
    const utilisation = data.utilisationNotes ?? "";
    const campaignStatus = data.isActive ? "active" : "paused";
    if (data.id) {
      await assertCampaignInWorkspace(workspace, data.id);
      const updated = await sql.query<{ id: number }>(
        workspace.isPlatformAdmin
          ? `update campaigns set
               slug=$1, title=$2, location_label=$3, country_code=$4, hero_image_url=$5,
               short_description=$6, situation_text=$7, mission_text=$8, relief_priorities=$9,
               utilisation_notes=$10, target_amount=$11, manual_amount_raised=$12,
               manual_donor_count=$13, is_featured=$14, is_active=$15, sort_order=$16,
               status=$17, updated_at=now()
             where id=$18
             returning id`
          : `update campaigns set
               slug=$1, title=$2, location_label=$3, country_code=$4, hero_image_url=$5,
               short_description=$6, situation_text=$7, mission_text=$8, relief_priorities=$9,
               utilisation_notes=$10, target_amount=$11, manual_amount_raised=$12,
               manual_donor_count=$13, is_featured=$14, is_active=$15, sort_order=$16,
               status=$17, updated_at=now()
             where id=$18 and organization_id=$19
             returning id`,
        workspace.isPlatformAdmin
          ? [
              data.slug,
              data.title,
              data.locationLabel,
              countryCode,
              hero,
              data.shortDescription,
              data.situationText,
              data.missionText,
              priorities,
              utilisation,
              data.targetAmount,
              data.manualAmountRaised,
              data.manualDonorCount,
              data.isFeatured,
              data.isActive,
              data.sortOrder,
              campaignStatus,
              data.id,
            ]
          : [
              data.slug,
              data.title,
              data.locationLabel,
              countryCode,
              hero,
              data.shortDescription,
              data.situationText,
              data.missionText,
              priorities,
              utilisation,
              data.targetAmount,
              data.manualAmountRaised,
              data.manualDonorCount,
              data.isFeatured,
              data.isActive,
              data.sortOrder,
              campaignStatus,
              data.id,
              workspace.organizationId,
            ],
      );
      if (!updated[0]) throw new Error("That campaign is not in your organization.");
      return { ok: true as const, id: data.id };
    }
    const inserted = await sql.query<{ id: number }>(
      `insert into campaigns (
         slug, title, location_label, country_code, hero_image_url, short_description,
         situation_text, mission_text, relief_priorities, utilisation_notes, target_amount,
         manual_amount_raised, manual_donor_count, is_featured, is_active, sort_order,
         organization_id, created_by, status
       ) values (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
         $17,
         (select id from "user" where id = $18),
         $19
       )
       returning id`,
      [
        data.slug,
        data.title,
        data.locationLabel,
        countryCode,
        hero,
        data.shortDescription,
        data.situationText,
        data.missionText,
        priorities,
        utilisation,
        data.targetAmount,
        data.manualAmountRaised,
        data.manualDonorCount,
        data.isFeatured,
        data.isActive,
        data.sortOrder,
        workspace.organizationId,
        context.userId,
        campaignStatus,
      ],
    );
    return { ok: true as const, id: inserted[0]?.id ?? 0 };
  });

export const listDonations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "viewDonations");
    const sql = await getSql();
    const rows = await sql.query<Record<string, unknown>>(
      workspace.isPlatformAdmin
        ? `select d.*, c.title as campaign_title, c.slug as campaign_slug
           from donations d join campaigns c on c.id = d.campaign_id
           order by d.created_at desc`
        : `select d.*, c.title as campaign_title, c.slug as campaign_slug
           from donations d join campaigns c on c.id = d.campaign_id
           where c.organization_id = $1
           order by d.created_at desc`,
      workspace.isPlatformAdmin ? [] : [workspace.organizationId],
    );
    return rows.map(mapDonation);
  });

export const listVolunteers = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "viewInbox");
    const sql = await getSql();
    const rows = workspace.isPlatformAdmin
      ? await sql`select * from volunteers order by created_at desc`
      : await sql`select * from volunteers where organization_id = ${workspace.organizationId} order by created_at desc`;
    return rows.map(mapVolunteer);
  });

export const listEnquiries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "viewInbox");
    const sql = await getSql();
    const rows = workspace.isPlatformAdmin
      ? await sql`select * from contact_enquiries order by created_at desc`
      : await sql`select * from contact_enquiries where organization_id = ${workspace.organizationId} order by created_at desc`;
    return rows.map(mapEnquiry);
  });

export const listUpdatesAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "viewCampaigns");
    const sql = await getSql();
    const rows = workspace.isPlatformAdmin
      ? await sql.query<Record<string, unknown>>(
          `select u.*, c.title as campaign_title from campaign_updates u
           join campaigns c on c.id = u.campaign_id
           order by u.created_at desc`,
        )
      : await sql.query<Record<string, unknown>>(
          `select u.*, c.title as campaign_title from campaign_updates u
           join campaigns c on c.id = u.campaign_id
           where c.organization_id = $1
           order by u.created_at desc`,
          [workspace.organizationId],
        );
    const campaigns = workspace.isPlatformAdmin
      ? await sql<{ id: number; title: string }>`select id, title from campaigns order by sort_order, id`
      : await sql<{ id: number; title: string }>`
          select id, title from campaigns where organization_id = ${workspace.organizationId} order by sort_order, id
        `;
    return { updates: rows.map(mapUpdate), campaigns };
  });

export const saveUpdate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(updateInputSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "writeCampaigns");
    await assertCampaignInWorkspace(workspace, data.campaignId);
    const sql = await getSql();
    if (data.id) {
      const updated = await sql.query<{ id: number }>(
        workspace.isPlatformAdmin
          ? `update campaign_updates set campaign_id=$1, title=$2, body=$3, published_at=$4
             where id=$5 returning id`
          : `update campaign_updates u set campaign_id=$1, title=$2, body=$3, published_at=$4
             from campaigns c
             where u.id=$5 and u.campaign_id = c.id and c.organization_id=$6
             returning u.id`,
        workspace.isPlatformAdmin
          ? [data.campaignId, data.title, data.body, data.published ? new Date().toISOString() : null, data.id]
          : [
              data.campaignId,
              data.title,
              data.body,
              data.published ? new Date().toISOString() : null,
              data.id,
              workspace.organizationId,
            ],
      );
      if (!updated[0]) throw new Error("That update is not in your organization.");
      return { ok: true as const };
    }
    await sql.query(
      `insert into campaign_updates (campaign_id, title, body, published_at)
       values ($1,$2,$3,$4)`,
      [data.campaignId, data.title, data.body, data.published ? new Date().toISOString() : null],
    );
    return { ok: true as const };
  });

export const deleteUpdate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "writeCampaigns");
    const sql = await getSql();
    const deleted = workspace.isPlatformAdmin
      ? await sql.query<{ id: number }>(`delete from campaign_updates where id = $1 returning id`, [data.id])
      : await sql.query<{ id: number }>(
          `delete from campaign_updates u
           using campaigns c
           where u.id = $1 and u.campaign_id = c.id and c.organization_id = $2
           returning u.id`,
          [data.id, workspace.organizationId],
        );
    if (!deleted[0]) throw new Error("That update is not in your organization.");
    return { ok: true as const };
  });

export const saveSettings = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(settingsInputSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    await sql.query(
      `update ngo_settings set
         org_name=$1, tagline=$2, about_text=$3, mission=$4, vision=$5, values_text=$6,
         areas_of_work=$7, address=$8, phone=$9, email=$10, whatsapp=$11,
         facebook_url=$12, instagram_url=$13, twitter_url=$14, maps_embed_url=$15,
         registration_cin=$16, registration_notes=$17, how_donations_used=$18,
         payment_info=$19, updated_at=now()
       where id=1`,
      [
        data.orgName,
        data.tagline,
        data.aboutText,
        data.mission,
        data.vision,
        data.valuesText,
        data.areasOfWork,
        data.address,
        data.phone,
        data.email,
        data.whatsapp,
        data.facebookUrl ?? "",
        data.instagramUrl ?? "",
        data.twitterUrl ?? "",
        data.mapsEmbedUrl ?? "",
        data.registrationCin ?? "",
        data.registrationNotes ?? "To be updated",
        data.howDonationsUsed,
        data.paymentInfo,
      ],
    );
    return { ok: true as const };
  });

export const getAdminSettings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    const rows = await sql<Record<string, unknown>>`select * from ngo_settings where id = 1`;
    if (!rows[0]) throw new Error("NGO settings are not initialised");
    return mapSettings(rows[0]);
  });

export const listReportsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    const rows = await sql`select * from reports order by created_at desc`;
    return rows.map(mapReport);
  });

export const saveReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(reportInputSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    if (data.id) {
      await sql.query(
        `update reports set title=$1, description=$2, url=$3, published_at=$4 where id=$5`,
        [
          data.title,
          data.description ?? "",
          data.url ?? "",
          data.published ? new Date().toISOString() : null,
          data.id,
        ],
      );
      return { ok: true as const };
    }
    await sql.query(
      `insert into reports (title, description, url, published_at) values ($1,$2,$3,$4)`,
      [
        data.title,
        data.description ?? "",
        data.url ?? "",
        data.published ? new Date().toISOString() : null,
      ],
    );
    return { ok: true as const };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    await sql`delete from reports where id = ${data.id}`;
    return { ok: true as const };
  });

export const listTeamAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    const rows = await sql`select * from team_members order by sort_order, id`;
    return rows.map(mapTeam);
  });

export const saveTeamMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(teamInputSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    if (data.id) {
      await sql.query(
        `update team_members set name=$1, role=$2, bio=$3, photo_url=$4, sort_order=$5 where id=$6`,
        [data.name, data.role, data.bio ?? "To be updated", data.photoUrl ?? "", data.sortOrder, data.id],
      );
      return { ok: true as const };
    }
    await sql.query(
      `insert into team_members (name, role, bio, photo_url, sort_order) values ($1,$2,$3,$4,$5)`,
      [data.name, data.role, data.bio ?? "To be updated", data.photoUrl ?? "", data.sortOrder],
    );
    return { ok: true as const };
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    await sql`delete from team_members where id = ${data.id}`;
    return { ok: true as const };
  });

export const listFaqsAdmin = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    const rows = await sql`select * from faqs order by sort_order, id`;
    return rows.map(mapFaq);
  });

export const saveFaq = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(faqInputSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    if (data.id) {
      await sql.query(
        `update faqs set question=$1, answer=$2, sort_order=$3, is_published=$4 where id=$5`,
        [data.question, data.answer, data.sortOrder, data.isPublished, data.id],
      );
      return { ok: true as const };
    }
    await sql.query(
      `insert into faqs (question, answer, sort_order, is_published) values ($1,$2,$3,$4)`,
      [data.question, data.answer, data.sortOrder, data.isPublished],
    );
    return { ok: true as const };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(idSchema)
  .handler(async ({ context, data }) => {
    const workspace = await resolveWorkspace(context.userId, context.bearerToken);
    assertPermission(workspace, "platformSite");
    const sql = await getSql();
    await sql`delete from faqs where id = ${data.id}`;
    return { ok: true as const };
  });
