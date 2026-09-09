import { Link } from "@tanstack/react-router";
import { dateLocale, useLanguage } from "@/lib/i18n";
import type { CampaignUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Prose } from "./prose";

export function UpdateCard({ update }: { update: CampaignUpdate }) {
  const { t, language, tValue } = useLanguage();
  const campaignTitle = tValue({ en: update.campaignTitle, hi: update.campaignTitleHi });
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">
        {formatDate(update.publishedAt ?? update.createdAt, dateLocale(language))}
        {campaignTitle ? ` · ${campaignTitle}` : ""}
      </p>
      <h3 className="mt-2 font-display text-xl text-navy">{tValue({ en: update.title, hi: update.titleHi })}</h3>
      <Prose text={tValue({ en: update.body, hi: update.bodyHi })} className="mt-3 text-sm" />
      {update.campaignSlug ? (
        <Link
          to="/campaign/$slug"
          params={{ slug: update.campaignSlug }}
          className="mt-4 inline-block text-sm font-semibold text-teal-dark"
        >
          {t("common.viewCampaign")}
        </Link>
      ) : null}
    </article>
  );
}
