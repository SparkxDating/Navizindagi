import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOrgRole, permissionsFor, roleAtLeast } from "../org-roles.ts";

describe("organization roles", () => {
  it("ranks owner above admin, campaign manager, and viewer", () => {
    assert.equal(roleAtLeast("owner", "admin"), true);
    assert.equal(roleAtLeast("admin", "campaign_manager"), true);
    assert.equal(roleAtLeast("campaign_manager", "viewer"), true);
    assert.equal(roleAtLeast("viewer", "admin"), false);
    assert.equal(roleAtLeast("campaign_manager", "admin"), false);
  });

  it("does not let an organization admin become a platform admin via permissions", () => {
    const orgAdmin = permissionsFor("admin", false, "other-org");
    assert.equal(orgAdmin.platformSite, false);
    assert.equal(orgAdmin.writeCampaigns, true);
    const platform = permissionsFor("viewer", true, "other-org");
    assert.equal(platform.platformSite, true);
    assert.equal(platform.writeCampaigns, true);
  });

  it("keeps viewers read-only", () => {
    const viewer = permissionsFor("viewer", false, "navi-zindagi-foundation");
    assert.equal(viewer.writeCampaigns, false);
    assert.equal(viewer.writeDonations, false);
    assert.equal(viewer.manageTeam, false);
    assert.equal(viewer.orgSettings, false);
    assert.equal(viewer.viewCampaigns, true);
    assert.equal(viewer.viewDonations, true);
  });

  it("lets campaign managers edit campaigns but not org settings or inbox PII", () => {
    const manager = permissionsFor("campaign_manager", false, "navi-zindagi-foundation");
    assert.equal(manager.writeCampaigns, true);
    assert.equal(manager.writeFundraisers, true);
    assert.equal(manager.writeDonations, false);
    assert.equal(manager.viewInbox, false);
    assert.equal(manager.orgSettings, false);
    assert.equal(manager.manageTeam, false);
  });

  it("does not grant default-org public-site editing to a foreign organization", () => {
    const foreignOwner = permissionsFor("owner", false, "another-ngo");
    assert.equal(foreignOwner.platformSite, false);
    assert.equal(foreignOwner.orgSettings, true);
    const homeOwner = permissionsFor("owner", false, "navi-zindagi-foundation");
    assert.equal(homeOwner.platformSite, true);
  });

  it("does not treat platform_admin as an organization role", () => {
    assert.equal(isOrgRole("platform_admin"), false);
    assert.equal(isOrgRole("admin"), true);
    assert.equal(isOrgRole("owner"), true);
  });
});
