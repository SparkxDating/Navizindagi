import { Link, createFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  HandHelping,
  HeartHandshake,
  ShieldCheck,
  Soup,
  Users,
  Waves,
} from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { CtaBand } from "@/components/cta-band";
import { ImpactCard } from "@/components/impact-card";
import { Section } from "@/components/section";
import { TrustBar } from "@/components/trust-bar";
import { UpdateCard } from "@/components/update-card";
import { Button } from "@/components/ui/button";
import { settingsField, useLanguage, usePageSeo, type MessageKey } from "@/lib/i18n";
import {
  ACTIVITY_PREVIEWS,
  APP_DESCRIPTION,
  APP_TITLE,
  SITE_URL,
  SUPPORT_STEPS,
  WHY_JOIN_POINTS,
  WORK_AREAS,
  displayTagline,
} from "@/lib/site";
import { getPublicSite } from "@/lib/server/site";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({
  loader: () => getPublicSite(),
  component: HomePage,
  head: () => ({
    meta: [
      { title: APP_TITLE },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: APP_TITLE },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
});

const WORK_ICONS: Record<string, ReactNode> = {
  disaster: <Waves className="size-8" aria-hidden />,
  "gau-seva": <HeartHandshake className="size-8" aria-hidden />,
  education: <GraduationCap className="size-8" aria-hidden />,
  food: <Soup className="size-8" aria-hidden />,
  community: <Users className="size-8" aria-hidden />,
  humanitarian: <HandHelping className="size-8" aria-hidden />,
};

function HomePage() {
  const { settings, campaigns, updates } = Route.useLoaderData();
  const { t, language } = useLanguage();
  usePageSeo(t("seo.homeTitle"), t("seo.homeDescription"));
  const nepal = campaigns.find((campaign) => campaign.slug === "nepal-flood-relief");
  const assam = campaigns.find((campaign) => campaign.slug === "assam-flood-relief");
  const liveCampaigns = [nepal, assam].filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign));
  const verifiedImpact = liveCampaigns.some((campaign) => campaign.amountRaised > 0 || campaign.donorCount > 0);

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <img
          src="/hero-banner.jpg"
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24 lg:py-28">
          <div className="reveal max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-soft">
              {settingsField(language, "tagline", displayTagline(settings.tagline))}
            </p>
            <h1 className="mt-4 font-display text-cream">{t("home.heroTitle")}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream/90 sm:text-lg">
              {t("home.heroDescription")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-h-12">
                <Link to="/donate" search={{ campaign: undefined }}>
                  {t("home.donate")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="cream" className="min-h-12">
                <Link to="/volunteer">{t("home.volunteer")}</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-cream/75">
              {settings.registrationCin
                ? t("home.cinNote", { cin: settings.registrationCin })
                : t("home.paymentNote")}
            </p>
          </div>
        </div>
      </section>

      <TrustBar settings={settings} />

      <Section
        id="about-foundation"
        eyebrow={t("home.whoEyebrow")}
        title={t("home.whoTitle")}
        lead={t("home.whoLead")}
      >
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-6 text-center shadow-card sm:p-8">
          <p className="text-base leading-relaxed text-muted-foreground">
            {settingsField(language, "aboutText", settings.aboutText)}
          </p>
          <Button asChild className="mt-6">
            <Link to="/about">{t("home.knowMore")}</Link>
          </Button>
        </div>
      </Section>

      <Section
        id="our-work"
        tone="cream"
        eyebrow={t("home.workEyebrow")}
        title={t("home.workTitle")}
        lead={t("home.workLead")}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_AREAS.map((area) => (
            <ImpactCard
              key={area.key}
              title={t(`home.work.${area.key}.title` as MessageKey)}
              body={t(`home.work.${area.key}.body` as MessageKey)}
              image={"image" in area ? area.image : undefined}
              icon={WORK_ICONS[area.key]}
              href="/about"
              hrefLabel={t("common.learnMore")}
            />
          ))}
        </div>
      </Section>

      <Section
        id="campaigns"
        eyebrow={t("home.campaignsEyebrow")}
        title={t("home.campaignsTitle")}
        lead={t("home.campaignsLead")}
      >
        {liveCampaigns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {liveCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t("home.campaignsEmpty")}</p>
        )}
        <h3 className="mt-12 text-center font-display text-2xl text-navy">{t("home.activitiesTitle")}</h3>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          {t("home.activitiesLead")}
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {WORK_AREAS.filter((area) => ["gau-seva", "education", "food"].includes(area.key)).map((area) => (
            <article
              key={area.key}
              className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-card transition-shadow duration-200 motion-safe:hover:shadow-card-hover"
            >
              <div className="text-teal">{WORK_ICONS[area.key]}</div>
              <h3 className="mt-3 font-display text-xl text-navy">{t(`home.work.${area.key}.title` as MessageKey)}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t(`home.work.${area.key}.body` as MessageKey)}
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link to="/about">{t("common.learnMore")}</Link>
              </Button>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/campaigns">{t("home.viewCampaigns")}</Link>
          </Button>
        </div>
      </Section>

      <Section
        id="how-support-helps"
        tone="cream"
        eyebrow={t("home.supportEyebrow")}
        title={t("home.supportTitle")}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUPPORT_STEPS.map((item) => (
            <article key={item.step} className="rounded-2xl bg-card p-6 shadow-card">
              <p className="font-display text-3xl text-teal">{item.step}</p>
              <h3 className="mt-3 font-display text-xl text-navy">{t(`home.steps.${item.key}.title` as MessageKey)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`home.steps.${item.key}.body` as MessageKey)}
              </p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="impact-glimpse"
        eyebrow={t("home.impactEyebrow")}
        title={t("home.impactTitle")}
        lead={verifiedImpact ? t("home.impactLeadRecorded") : t("home.impactLeadSoon")}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIVITY_PREVIEWS.map((item) => (
            <article key={item.key} className="overflow-hidden rounded-2xl bg-card shadow-card">
              {"image" in item && item.image ? (
                <img src={item.image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-teal-soft text-sm font-semibold text-teal-dark">
                  {t(`home.preview.${item.key}` as MessageKey)}
                </div>
              )}
              <h3 className="p-4 font-display text-lg text-navy">{t(`home.preview.${item.key}` as MessageKey)}</h3>
            </article>
          ))}
        </div>
        {updates.length > 0 ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {updates.slice(0, 2).map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : null}
      </Section>

      <Section
        id="why-join"
        tone="cream"
        eyebrow={t("home.trustEyebrow")}
        title={t("home.whyTitle")}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_JOIN_POINTS.map((point) => (
            <article key={point.key} className="rounded-2xl bg-card p-6 shadow-card">
              <ShieldCheck className="size-5 text-teal" aria-hidden />
              <h3 className="mt-3 font-display text-lg text-navy">{t(`home.why.${point.key}` as MessageKey)}</h3>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/transparency">{t("home.viewTransparency")}</Link>
          </Button>
        </div>
      </Section>

      <Section id="activity-gallery" title={t("home.galleryTitle")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <img src="/campaign-assam.jpg" alt="" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
          <img src="/relief-water.jpg" alt="" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
          <img src="/relief-shelter.jpg" alt="" className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card" loading="lazy" />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{t("home.galleryNote")}</p>
      </Section>

      <Section id="volunteer-cta" tone="navy">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl text-cream sm:text-4xl">{t("home.volunteerTitle")}</h2>
          <p className="mt-4 text-base leading-relaxed text-cream/80">{t("home.volunteerLead")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="cream">
              <Link to="/volunteer">
                <Users className="size-4" />
                {t("home.becomeVolunteer")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/30 bg-transparent text-cream hover:bg-navy-mid">
              <Link to="/contact">{t("home.contactUs")}</Link>
            </Button>
          </div>
        </div>
      </Section>

      <CtaBand
        title={t("home.finalTitle")}
        actions={
          <>
            <Button asChild size="lg">
              <Link to="/donate" search={{ campaign: undefined }}>
                {t("home.donate")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="cream">
              <Link to="/campaigns">{t("home.viewCampaigns")}</Link>
            </Button>
          </>
        }
      />
    </>
  );
}
