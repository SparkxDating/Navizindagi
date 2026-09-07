import { getSessionUser } from "@/lib/auth/verify.server";
import { getSql } from "@/lib/db";
import {
  DEFAULT_ORG_SLUG,
  isOrgRole,
  isPlatformAdminRole,
  permissionsFor,
  type OrgPermissions,
  type OrgRole,
} from "@/lib/org-roles";

export {
  DEFAULT_ORG_SLUG,
  isOrgRole,
  isPlatformAdminRole,
  permissionsFor,
  roleAtLeast,
  type OrgPermissions,
  type OrgRole,
} from "@/lib/org-roles";

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "You are not authorised to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type Workspace = {
  userId: string;
  isPlatformAdmin: boolean;
  organizationId: number;
  organizationName: string;
  organizationSlug: string;
  role: OrgRole;
  permissions: OrgPermissions;
};

type MemberRow = {
  organization_id: number;
  organization_name: string;
  organization_slug: string;
  role: string;
};

async function ensurePlatformBootstrap(userId: string, bearerToken?: string) {
  const sql = await getSql();
  const admins = await sql<{ user_id: string; role: string }>`select user_id, role from admin_users`;
  if (admins.length === 0) {
    const session = await getSessionUser(bearerToken);
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const sessionEmail = session?.email?.trim().toLowerCase() ?? "";
    if (!bootstrapEmail || !sessionEmail || sessionEmail !== bootstrapEmail) {
      throw new ForbiddenError("This account is not authorised for the dashboard.");
    }
    await sql.query(
      `insert into admin_users (user_id, email, role) values ($1, $2, 'platform_admin')
       on conflict (user_id) do nothing`,
      [userId, session?.email ?? ""],
    );
  }
  await sql.query(
    `insert into organization_members (organization_id, user_id, role)
     select o.id, $1, 'owner'
     from organizations o
     where o.slug = $2
       and exists (select 1 from "user" u where u.id = $1)
       and exists (select 1 from admin_users a where a.user_id = $1)
     on conflict (organization_id, user_id) do nothing`,
    [userId, DEFAULT_ORG_SLUG],
  );
}

export async function resolveWorkspace(userId: string, bearerToken?: string): Promise<Workspace> {
  const sql = await getSql();
  await ensurePlatformBootstrap(userId, bearerToken);

  const platformRows = await sql<{ user_id: string; role: string }>`
    select user_id, role from admin_users where user_id = ${userId}
  `;
  const isPlatformAdmin = platformRows.some((row) => isPlatformAdminRole(row.role));

  const memberships = await sql<MemberRow>`
    select m.organization_id, o.name as organization_name, o.slug as organization_slug, m.role
    from organization_members m
    join organizations o on o.id = m.organization_id
    where m.user_id = ${userId}
    order by m.id
  `;

  const membership = memberships[0];
  if (!membership && !isPlatformAdmin) {
    throw new ForbiddenError("This account is signed in but is not a member of an organization.");
  }

  let organizationId = membership?.organization_id;
  let organizationName = membership?.organization_name ?? "Platform";
  let organizationSlug = membership?.organization_slug ?? DEFAULT_ORG_SLUG;
  const role: OrgRole = membership && isOrgRole(membership.role) ? membership.role : "viewer";

  if (!organizationId) {
    const fallback = await sql<{ id: number; name: string; slug: string }>`
      select id, name, slug from organizations where slug = ${DEFAULT_ORG_SLUG} limit 1
    `;
    if (!fallback[0]) throw new ForbiddenError();
    organizationId = fallback[0].id;
    organizationName = fallback[0].name;
    organizationSlug = fallback[0].slug;
  }

  return {
    userId,
    isPlatformAdmin,
    organizationId,
    organizationName,
    organizationSlug,
    role,
    permissions: permissionsFor(role, isPlatformAdmin, organizationSlug),
  };
}

export function assertPermission(workspace: Workspace, key: keyof OrgPermissions) {
  if (!workspace.permissions[key]) {
    throw new ForbiddenError();
  }
}

export async function assertCampaignInWorkspace(workspace: Workspace, campaignId: number) {
  const sql = await getSql();
  const rows = workspace.isPlatformAdmin
    ? await sql.query<{ id: number; organization_id: number }>(
        `select id, organization_id from campaigns where id = $1`,
        [campaignId],
      )
    : await sql.query<{ id: number; organization_id: number }>(
        `select id, organization_id from campaigns where id = $1 and organization_id = $2`,
        [campaignId, workspace.organizationId],
      );
  if (!rows[0]) throw new ForbiddenError("That campaign is not in your organization.");
  return rows[0];
}
