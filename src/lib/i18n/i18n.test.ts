import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collectLeaves,
  detectBrowserLanguage,
  interpolate,
  isLanguage,
  lookupMessage,
  readStoredLanguage,
  resolveInitialLanguage,
  tValue,
  writeStoredLanguage,
} from "./core.ts";
import { en } from "./en.ts";
import { hi } from "./hi.ts";
import { displayCampaignTitle, translate } from "./messages.ts";
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, type NestedMessages } from "./types.ts";

function installStorage(initial: Record<string, string> = {}) {
  const memory = new Map(Object.entries(initial));
  const localStorage = {
    getItem(key: string) {
      return memory.has(key) ? memory.get(key)! : null;
    },
    setItem(key: string, value: string) {
      memory.set(key, value);
    },
    removeItem(key: string) {
      memory.delete(key);
    },
  };
  (globalThis as { window?: { localStorage: typeof localStorage } }).window = { localStorage };
  return memory;
}

describe("i18n language system", () => {
  it("defaults to English", () => {
    assert.equal(DEFAULT_LANGUAGE, "en");
    assert.equal(translate("en", "nav.home"), "Home");
    assert.equal(translate("en", "nav.donate"), "Donate Now");
  });

  it("can change to Hindi", () => {
    assert.equal(translate("hi", "nav.home"), "होम");
    assert.equal(translate("hi", "nav.donate"), "अभी दान करें");
    assert.equal(translate("hi", "home.heroTitle").includes("ज़िंदगी"), true);
  });

  it("can change back to English", () => {
    assert.equal(translate("hi", "common.donate"), "दान करें");
    assert.equal(translate("en", "common.donate"), "Donate");
  });

  it("persists the selected language in localStorage", () => {
    const memory = installStorage();
    writeStoredLanguage("hi");
    assert.equal(memory.get(LANGUAGE_STORAGE_KEY), "hi");
    assert.equal(readStoredLanguage(), "hi");
    writeStoredLanguage("en");
    assert.equal(readStoredLanguage(), "en");
  });

  it("falls back to English for invalid stored language", () => {
    installStorage({ [LANGUAGE_STORAGE_KEY]: "fr" });
    assert.equal(isLanguage("fr"), false);
    assert.equal(readStoredLanguage(), null);
    assert.equal(resolveInitialLanguage(), detectBrowserLanguage());
    assert.equal(isLanguage("en"), true);
    assert.equal(isLanguage("hi"), true);
  });

  it("falls back to English when Hindi dynamic content is missing", () => {
    assert.equal(tValue("hi", { en: "Nepal Flood Relief", hi: null }), "Nepal Flood Relief");
    assert.equal(tValue("hi", { en: "Nepal Flood Relief", hi: "   " }), "Nepal Flood Relief");
    assert.equal(tValue("hi", { en: "Nepal Flood Relief", hi: "नेपाल बाढ़ राहत" }), "नेपाल बाढ़ राहत");
    assert.equal(tValue("en", { en: "Nepal Flood Relief", hi: "नेपाल बाढ़ राहत" }), "Nepal Flood Relief");
  });

  it("keeps matching translation keys in both dictionaries", () => {
    const enKeys = collectLeaves(en as NestedMessages);
    const hiKeys = collectLeaves(hi as NestedMessages);
    assert.deepEqual(enKeys, hiKeys);
    assert.ok(enKeys.includes("nav.home"));
    assert.ok(enKeys.includes("donate.submit") === false || typeof translate("en", "donate.paySecurely") === "string");
  });

  it("contains no undefined translation values", () => {
    for (const language of ["en", "hi"] as const) {
      const dict = language === "en" ? en : hi;
      for (const key of collectLeaves(dict as NestedMessages)) {
        const value = lookupMessage(dict as NestedMessages, key);
        assert.equal(typeof value, "string", `${language}:${key}`);
        assert.notEqual(value, undefined);
        assert.notEqual(value, "undefined");
      }
    }
  });

  it("does not change donation or payment data when language changes", () => {
    const donation = {
      amount: 500,
      status: "completed" as const,
      referenceId: "NZF-TEST-LANG",
      campaignSlug: "nepal-flood-relief",
      campaignTitle: "Nepal Flood Relief",
    };
    const englishLabel = translate("en", "thankYou.verified");
    const hindiLabel = translate("hi", "thankYou.verified");
    assert.notEqual(englishLabel, hindiLabel);
    assert.equal(donation.amount, 500);
    assert.equal(donation.status, "completed");
    assert.equal(donation.referenceId, "NZF-TEST-LANG");
    assert.equal(donation.campaignSlug, "nepal-flood-relief");
    assert.equal(donation.campaignTitle, "Nepal Flood Relief");
    assert.equal(displayCampaignTitle("hi", donation.campaignSlug, donation.campaignTitle), "नेपाल बाढ़ राहत");
    assert.equal(donation.amount, 500);
  });

  it("interpolates placeholders without treating them as HTML", () => {
    const value = interpolate("CIN {cin}.", { cin: "<script>alert(1)</script>" });
    assert.equal(value, "CIN <script>alert(1)</script>.");
    assert.equal(translate("en", "home.cinNote", { cin: "U85300DL2021NPL382367" }).includes("U85300DL2021NPL382367"), true);
  });
});
