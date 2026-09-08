import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { BulletList, Prose } from "@/components/prose";
import { PageHero, Section } from "@/components/section";
import { localizeDb, useLanguage, usePageSeo } from "@/lib/i18n";
import { getPublicSite } from "@/lib/server/site";
import { SITE_URL, displayTagline } from "@/lib/site";

export const Route = createFileRoute("/about")({
  loader: () => getPublicSite(),
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "Learn about Navi Zindagi Foundation — mission, vision, values and community work. Unpublished details are labelled To be updated.",
      },
      { property: "og:title", content: "About · Navi Zindagi Foundation" },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
    ],
  }),
});

function AboutPage() {
  const { settings, team } = Route.useLoaderData();
  const { t, tValue, language } = useLanguage();
  usePageSeo(t("seo.aboutTitle"), t("seo.aboutDescription"));
  const fallback = t("common.toBeUpdated");

  return (
    <>
      <PageHero
        eyebrow={t("about.eyebrow")}
        title={settings.orgName}
        lead={localizeDb(language, displayTagline(settings.tagline))}
        image="/facebook-cover.jpg"
        imageAlt={t("nav.logoAlt")}
      />
      <Section title={t("about.story")}>
        <Prose text={tValue({ en: settings.aboutText, hi: null })} className="mx-auto max-w-3xl" />
      </Section>
      <Section tone="cream" title={t("about.mvv")}>
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-xl text-navy">{t("about.mission")}</h3>
            <Prose className="mt-3 text-sm" text={tValue({ en: settings.mission, hi: null }) || fallback} />
          </article>
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-xl text-navy">{t("about.vision")}</h3>
            <Prose className="mt-3 text-sm" text={tValue({ en: settings.vision, hi: null }) || fallback} />
          </article>
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-xl text-navy">{t("about.values")}</h3>
            <BulletList className="mt-3 text-sm" text={tValue({ en: settings.valuesText, hi: null }) || fallback} />
          </article>
        </div>
      </Section>
      <Section id="what-we-do" title={t("about.whatWeDo")}>
        <div className="mx-auto max-w-3xl">
          <BulletList text={tValue({ en: settings.areasOfWork, hi: null }) || fallback} />
        </div>
      </Section>
      <Section tone="cream" title={t("about.where")}>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <MapPin className="size-4 text-teal" />
              Nepal
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("about.nepalNote")}</p>
          </article>
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <MapPin className="size-4 text-teal" />
              Assam, India
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("about.assamNote")}</p>
          </article>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-muted-foreground">
          {t("about.registeredOffice")}: {settings.address || fallback}
        </p>
      </Section>
      <Section title={t("about.team")}>
        {team.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("about.teamEmpty")}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <article key={member.id} className="rounded-2xl bg-card p-6 shadow-card">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} className="mb-4 size-20 rounded-full object-cover" />
                ) : (
                  <div className="mb-4 grid size-20 place-items-center rounded-full bg-teal-soft font-display text-2xl text-teal-dark">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-display text-xl text-navy">{member.name}</h3>
                <p className="text-sm font-medium text-teal-dark">{tValue({ en: member.role, hi: null }) || fallback}</p>
                <p className="mt-2 text-sm text-muted-foreground">{tValue({ en: member.bio, hi: null }) || fallback}</p>
              </article>
            ))}
          </div>
        )}
      </Section>
      <Section tone="cream" title={t("about.orgInfo")}>
        <dl className="mx-auto max-w-3xl space-y-4 rounded-2xl bg-card p-6 shadow-card text-sm">
          <div>
            <dt className="text-muted-foreground">{t("about.legalName")}</dt>
            <dd className="font-medium text-navy">{settings.orgName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("common.cin")}</dt>
            <dd className="font-medium text-navy">{settings.registrationCin || fallback}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("about.registeredOffice")}</dt>
            <dd className="font-medium text-navy">{settings.address || fallback}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t("about.notes")}</dt>
            <dd className="text-muted-foreground">{tValue({ en: settings.registrationNotes, hi: null }) || fallback}</dd>
          </div>
        </dl>
      </Section>
    </>
  );
}
