export type OrgRole = "owner" | "admin" | "campaign_manager" | "viewer";

const ROLE_RANK: Record<OrgRole, number> = {
  viewer: 1,
  campaign_manager: 2,
  admin: 3,
  owner: 4,
};

export const DEFAULT_ORG_SLUG = "navi-zindagi-foundation";

export function isOrgRole(value: string): value is OrgRole {
  return value === "owner" || value === "admin" || value === "campaign_manager" || value === "viewer";
}

export function isPlatformAdminRole(role: string) {
  return role === "platform_admin" || role === "admin";
}

export function roleAtLeast(role: OrgRole, minimum: OrgRole) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export type OrgPermissions = {
  viewDashboard: boolean;
  viewCampaigns: boolean;
  writeCampaigns: boolean;
  viewDonations: boolean;
  writeDonations: boolean;
  viewFundraisers: boolean;
  writeFundraisers: boolean;
  viewAnalytics: boolean;
  manageTeam: boolean;
  orgSettings: boolean;
  viewInbox: boolean;
  platformSite: boolean;
};

export function permissionsFor(
  role: OrgRole,
  isPlatformAdmin: boolean,
  organizationSlug = DEFAULT_ORG_SLUG,
): OrgPermissions {
  const defaultOrg = organizationSlug === DEFAULT_ORG_SLUG;
  if (isPlatformAdmin) {
    return {
      viewDashboard: true,
      viewCampaigns: true,
      writeCampaigns: true,
      viewDonations: true,
      writeDonations: true,
      viewFundraisers: true,
      writeFundraisers: true,
      viewAnalytics: true,
      manageTeam: true,
      orgSettings: true,
      viewInbox: true,
      platformSite: true,
    };
  }
  return {
    viewDashboard: true,
    viewCampaigns: true,
    writeCampaigns: roleAtLeast(role, "campaign_manager"),
    viewDonations: true,
    writeDonations: roleAtLeast(role, "admin"),
    viewFundraisers: true,
    writeFundraisers: roleAtLeast(role, "campaign_manager"),
    viewAnalytics: true,
    manageTeam: role === "owner",
    orgSettings: role === "owner",
    viewInbox: roleAtLeast(role, "admin"),
    platformSite: defaultOrg && roleAtLeast(role, "admin"),
  };
}
