import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CampaignCard } from "@/components/campaign-card";
import { BulletList, Prose } from "@/components/prose";
import { ShareButtons } from "@/components/share-buttons";
import { UpdateCard } from "@/components/update-card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { StatTile } from "@/components/stat-tile";
import { dateLocale, displayCampaignTitle, localizeDb, useLanguage, usePageSeo } from "@/lib/i18n";
import { getCampaignPage } from "@/lib/server/site";
import { RELIEF_CATEGORIES, SITE_URL } from "@/lib/site";
import { formatDate, formatINR } from "@/lib/utils";

export const Route = createFileRoute("/campaign/$slug")({
  loader: async ({ params }) => {
    const data = await getCampaignPage({ data: { slug: params.slug } });
    if (!data.campaign) throw notFound();
    return data;
  },
  component: CampaignPage,
  head: ({ loaderData }) => {
    const campaign = loaderData?.campaign;
    const title = `${campaign?.title ?? "Campaign"} · Navi Zindagi Foundation`;
    const description = campaign?.shortDescription ?? "Flood relief campaign";
    const image = campaign?.heroImageUrl?.startsWith("http")
      ? campaign.heroImageUrl
      : `${SITE_URL}${campaign?.heroImageUrl || "/og.jpg"}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
    };
  },
});

function CampaignPage() {
  const { campaign, updates, campaigns, settings } = Route.useLoaderData();
  const { t, language, tValue } = useLanguage();
  const locale = dateLocale(language);
  const title = campaign ? displayCampaignTitle(language, campaign.slug, campaign.title) : "";
  const description = campaign ? tValue({ en: campaign.shortDescription, hi: null }) : "";
  const location = campaign ? localizeDb(language, campaign.locationLabel) : "";
  usePageSeo(title ? `${title} · Navi Zindagi Foundation` : t("seo.campaignsTitle"), description);
  if (!campaign) return null;
  const others = campaigns.filter((item) => item.id !== campaign.id && item.slug !== "general-relief");
  const hasFigures = campaign.targetAmount > 0 || campaign.amountRaised > 0;
  const fallback = t("common.toBeUpdated");
  const gallery = [
    campaign.heroImageUrl ? { src: campaign.heroImageUrl, alt: title } : null,
    ...RELIEF_CATEGORIES.filter((item) =>
      campaign.reliefPriorities.some((priority) => priority.toLowerCase().includes(item.title.split(" ")[0].toLowerCase())),
    ).map((item) => ({ src: item.image, alt: t("campaign.reliefAlt", { title: localizeDb(language, item.title) }) })),
  ].filter((item, index, list): item is { src: string; alt: string } => {
    if (!item) return false;
    return list.findIndex((other) => other?.src === item.src) === index;
  });

  function statusLabel(status: string, isActive: boolean) {
    if (status === "active" && isActive) return t("campaign.active");
    if (status === "paused") return t("campaign.paused");
    if (status === "completed") return t("campaign.completed");
    return isActive ? t("campaign.active") : status;
  }

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        {campaign.heroImageUrl ? (
          <img
            src={campaign.heroImageUrl}
            alt={`${title} · ${location}`}
            className="absolute inset-0 size-full object-cover opacity-45"
            fetchPriority="high"
          />
        ) : null}
        <div className="absolute inset-0 bg-navy/75" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-soft">{location}</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl text-cream sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base text-cream/85">{description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-cream/80">
            <span className="rounded-full bg-teal px-3 py-1 text-xs font-semibold text-primary-foreground">
              {statusLabel(campaign.status, campaign.isActive)}
            </span>
            <span>
              {t("campaign.lastUpdated")} {formatDate(campaign.updatedAt, locale)}
            </span>
          </div>
          <Button asChild size="lg" className="mt-8">
            <Link to="/donate" search={{ campaign: campaign.slug }}>
              {t("campaign.donateThis")}
            </Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-12">
          <section>
            <h2 className="font-display text-2xl text-navy">{t("campaign.situation")}</h2>
            <Prose className="mt-4" text={tValue({ en: campaign.situationText, hi: null })} />
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">{t("campaign.response")}</h2>
            <Prose className="mt-4" text={tValue({ en: campaign.missionText, hi: null })} />
            <ul className="mt-6 space-y-2 text-muted-foreground">
              {campaign.reliefPriorities.length === 0 ? (
                <li>{fallback}</li>
              ) : (
                campaign.reliefPriorities.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
                    {localizeDb(language, item)}
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">{t("campaign.progress")}</h2>
            <div className="mt-4 rounded-2xl bg-cream p-5">
              {hasFigures ? (
                <>
                  <p className="font-display text-3xl tabular-nums text-navy">{formatINR(campaign.amountRaised, locale)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("campaign.statusTarget", {
                      value: campaign.targetAmount > 0 ? formatINR(campaign.targetAmount, locale) : fallback,
                    })}
                  </p>
                  <ProgressBar className="mt-3" raised={campaign.amountRaised} target={campaign.targetAmount} />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("campaign.figuresSoon")}</p>
              )}
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">{t("campaign.impact")}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("campaign.impactNote")}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <StatTile label={t("campaign.families")} value={t("common.updatesComing")} />
              <StatTile
                label={t("campaign.verifiedDonations")}
                value={campaign.donorCount > 0 ? String(campaign.donorCount) : t("common.updatesComing")}
              />
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">{t("campaign.updates")}</h2>
            <div className="mt-4 space-y-4">
              {updates.length === 0 ? (
                <p className="rounded-2xl bg-cream p-5 text-sm text-muted-foreground">{t("campaign.updatesEmpty")}</p>
              ) : (
                updates.map((update) => <UpdateCard key={update.id} update={update} />)
              )}
            </div>
          </section>
          {gallery.length > 0 ? (
            <section>
              <h2 className="font-display text-2xl text-navy">{t("campaign.gallery")}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {gallery.map((item) => (
                  <img
                    key={item.src}
                    src={item.src}
                    alt={item.alt}
                    className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card"
                    loading="lazy"
                  />
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <h2 className="font-display text-2xl text-navy">{t("campaign.transparency")}</h2>
            <BulletList className="mt-4 text-sm" text={tValue({ en: campaign.utilisationNotes, hi: null })} />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("campaign.orgNotes")}: {tValue({ en: settings.registrationNotes, hi: null }) || fallback}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/transparency">{t("campaign.viewOrgTransparency")}</Link>
            </Button>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            {hasFigures ? (
              <>
                <StatTile
                  label={t("campaign.amountRaised")}
                  value={formatINR(campaign.amountRaised, locale)}
                  hint={
                    campaign.donorCount > 0
                      ? `${campaign.donorCount} ${campaign.donorCount === 1 ? t("common.verifiedDonation") : t("common.verifiedDonations")}`
                      : t("campaign.donorCountSoon")
                  }
                  className="p-0 shadow-none"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  {t("campaign.statusTarget", {
                    value: campaign.targetAmount > 0 ? formatINR(campaign.targetAmount, locale) : fallback,
                  })}
                </p>
                <ProgressBar className="mt-3" raised={campaign.amountRaised} target={campaign.targetAmount} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("campaign.figuresSoon")}</p>
            )}
            <Button asChild className="mt-5 w-full min-h-12">
              <Link to="/donate" search={{ campaign: campaign.slug }}>
                {t("nav.donate")}
              </Link>
            </Button>
            <ShareButtons className="mt-5" title={title} path={`/campaign/${campaign.slug}`} />
          </div>
          <div className="rounded-2xl bg-cream p-6">
            <h2 className="font-display text-xl text-navy">{t("campaign.volunteer")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("campaign.volunteerNote")}</p>
            <Button asChild variant="navy" className="mt-4 w-full">
              <Link to="/volunteer">{t("campaign.becomeVolunteer")}</Link>
            </Button>
          </div>
        </aside>
      </div>

      <section className="bg-navy px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-3xl text-cream">{t("campaign.donateHeading", { title })}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-cream/75">{t("campaign.donateLead")}</p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/donate" search={{ campaign: campaign.slug }}>
            {t("nav.donate")}
          </Link>
        </Button>
      </section>

      {others.length > 0 ? (
        <section className="bg-cream px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl text-navy">{t("campaign.other")}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {others.map((item) => (
                <CampaignCard key={item.id} campaign={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <Button asChild className="w-full min-h-12">
          <Link to="/donate" search={{ campaign: campaign.slug }}>
            {t("campaign.donateTo", { title })}
          </Link>
        </Button>
      </div>
    </>
  );
}
