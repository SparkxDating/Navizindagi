import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Headphones, LifeBuoy, MapPin } from "lucide-react";
import { VolunteerForm } from "@/components/volunteer-form";
import { PageHero } from "@/components/section";
import { useLanguage, usePageSeo, type MessageKey } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/volunteer")({
  component: VolunteerPage,
  head: () => ({
    meta: [
      { title: "Volunteer · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "Register to volunteer with Navi Zindagi Foundation for flood-relief fundraising, logistics and community support.",
      },
      { property: "og:title", content: "Volunteer · Navi Zindagi Foundation" },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
    ],
  }),
});

const ROLES = [
  { titleKey: "volunteer.local", bodyKey: "volunteer.localBody", icon: MapPin },
  { titleKey: "volunteer.emergency", bodyKey: "volunteer.emergencyBody", icon: LifeBuoy },
  { titleKey: "volunteer.community", bodyKey: "volunteer.communityBody", icon: HeartHandshake },
  { titleKey: "volunteer.online", bodyKey: "volunteer.onlineBody", icon: Headphones },
] as const;

function VolunteerPage() {
  const { t } = useLanguage();
  usePageSeo(t("seo.volunteerTitle"), t("seo.volunteerDescription"));

  return (
    <>
      <PageHero
        eyebrow={t("volunteer.eyebrow")}
        title={t("volunteer.title")}
        lead={t("volunteer.lead")}
        image="/relief-shelter.jpg"
        imageAlt={t("volunteer.title")}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {ROLES.map((role) => (
              <article key={role.titleKey} className="rounded-2xl bg-card p-5 shadow-card">
                <p className="flex items-center gap-2 font-display text-lg text-navy">
                  <role.icon className="size-4 text-teal" aria-hidden />
                  {t(role.titleKey)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t(role.bodyKey as MessageKey)}</p>
              </article>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t("volunteer.noClaim")}</p>
        </aside>
        <VolunteerForm />
      </div>
    </>
  );
}
