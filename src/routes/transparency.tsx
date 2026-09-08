import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Prose } from "@/components/prose";
import { PageHero, Section } from "@/components/section";
import { ProgressBar } from "@/components/ui/progress";
import { dateLocale, displayCampaignTitle, useLanguage, usePageSeo } from "@/lib/i18n";
import { getPublicSite } from "@/lib/server/site";
import { SITE_URL } from "@/lib/site";
import { formatDate, formatINR } from "@/lib/utils";

export const Route = createFileRoute("/transparency")({
  loader: () => getPublicSite(),
  component: TransparencyPage,
  head: () => ({
    meta: [
      { title: "Transparency · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "How Navi Zindagi Foundation uses flood-relief donations, campaign utilisation, reports and FAQs.",
      },
      { property: "og:title", content: "Transparency · Navi Zindagi Foundation" },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
    ],
  }),
});

function TransparencyPage() {
  const { settings, campaigns, faqs, reports } = Route.useLoaderData();
  const { t, language, tValue } = useLanguage();
  const locale = dateLocale(language);
  const fallback = t("common.toBeUpdated");
  usePageSeo(t("seo.transparencyTitle"), t("seo.transparencyDescription"));

  return (
    <>
      <PageHero
        eyebrow={t("transparency.eyebrow")}
        title={t("transparency.title")}
        lead={t("transparency.lead")}
      />
      <Section>
        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">{t("transparency.cin")}</p>
            <p className="mt-2 font-medium text-navy">{settings.registrationCin || fallback}</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">{t("transparency.office")}</p>
            <p className="mt-2 text-sm font-medium text-navy">{settings.address || fallback}</p>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">
              <ShieldCheck className="size-4" />
              {t("transparency.tax")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {tValue({ en: settings.registrationNotes, hi: null }) || fallback}
            </p>
          </div>
        </div>
      </Section>
      <Section tone="cream">
        <Prose className="mx-auto max-w-3xl" text={tValue({ en: settings.howDonationsUsed, hi: null })} />
      </Section>
      <Section title={t("transparency.utilisation")}>
        <div className="grid gap-5">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-2xl bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h3 className="font-display text-2xl text-navy">
                  {displayCampaignTitle(language, campaign.slug, campaign.title)}
                </h3>
                <p className="text-sm tabular-nums text-navy">
                  {campaign.amountRaised > 0 || campaign.targetAmount > 0
                    ? t("transparency.raised", { amount: formatINR(campaign.amountRaised, locale) })
                    : t("common.updatesComing")}
                </p>
              </div>
              <ProgressBar className="mt-4" raised={campaign.amountRaised} target={campaign.targetAmount} />
              <p className="mt-4 text-sm text-muted-foreground">
                {tValue({ en: campaign.utilisationNotes, hi: null })}
              </p>
            </article>
          ))}
        </div>
      </Section>
      <Section tone="cream" title={t("transparency.reports")}>
        {reports.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("transparency.reportsEmpty")}</p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-2xl bg-card p-5 shadow-card">
                <p className="font-semibold text-navy">{tValue({ en: report.title, hi: null })}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tValue({ en: report.description, hi: null }) || fallback}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(report.publishedAt, locale)}</p>
                {report.url ? (
                  <a href={report.url} className="mt-2 inline-block text-sm font-medium text-teal-dark underline">
                    {t("transparency.openDoc")}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section title={t("transparency.payment")}>
        <Prose className="mx-auto max-w-3xl" text={tValue({ en: settings.paymentInfo, hi: null })} />
      </Section>
      <Section tone="cream" title={t("transparency.faq")}>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details key={faq.id} className="rounded-2xl bg-card p-5 shadow-card">
              <summary className="cursor-pointer font-semibold text-navy">{tValue({ en: faq.question, hi: null })}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tValue({ en: faq.answer, hi: null })}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
