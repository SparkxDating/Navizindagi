import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { dateLocale, displayCampaignTitle, localizeDb, useLanguage } from "@/lib/i18n";
import type { Campaign } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

export function CampaignCard({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const { t, language, tValue } = useLanguage();
  const title = displayCampaignTitle(language, campaign.slug, campaign.title);
  const description = tValue({ en: campaign.shortDescription, hi: null });
  const location = localizeDb(language, campaign.locationLabel);
  const hasFigures = campaign.targetAmount > 0 || campaign.amountRaised > 0;
  const locale = dateLocale(language);
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        {campaign.heroImageUrl ? (
          <img
            src={campaign.heroImageUrl}
            alt={`${title} · ${location}`}
            className="size-full object-cover transition-transform duration-500 ease-out motion-safe:hover:scale-[1.03]"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-navy/70 p-4">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-navy">
            <MapPin className="size-3.5" aria-hidden />
            {location}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h3 className="font-display text-2xl text-navy">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="mt-auto space-y-3">
          <div className="flex items-end justify-between gap-3 text-sm">
            {campaign.amountRaised > 0 ? (
              <p>
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">{t("common.raised")}</span>
                <span className="font-semibold tabular-nums text-navy">{formatINR(campaign.amountRaised, locale)}</span>
              </p>
            ) : (
              <p>
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">{t("common.raised")}</span>
                <span className="text-sm text-muted-foreground">{t("common.toBeUpdated")}</span>
              </p>
            )}
            <p className="text-right">
              <span className="block text-xs uppercase tracking-wide text-muted-foreground">{t("common.target")}</span>
              <span className="font-semibold tabular-nums text-navy">
                {campaign.targetAmount > 0 ? formatINR(campaign.targetAmount, locale) : t("common.toBeUpdated")}
              </span>
            </p>
          </div>
          {hasFigures ? (
            <>
              <ProgressBar raised={campaign.amountRaised} target={campaign.targetAmount} />
              {campaign.donorCount > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {campaign.donorCount}{" "}
                  {campaign.donorCount === 1 ? t("common.verifiedDonation") : t("common.verifiedDonations")}
                </p>
              ) : null}
            </>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="min-h-12 flex-1">
              <Link to="/donate" search={{ campaign: campaign.slug }}>
                {t("common.donate")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-12 flex-1">
              <Link to="/campaign/$slug" params={{ slug: campaign.slug }}>
                {t("common.viewCampaign")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
