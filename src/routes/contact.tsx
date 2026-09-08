import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/section";
import { useLanguage, usePageSeo } from "@/lib/i18n";
import { getPublicSite } from "@/lib/server/site";
import { whatsappHref } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  loader: () => getPublicSite(),
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact · Navi Zindagi Foundation" },
      {
        name: "description",
        content: "Contact Navi Zindagi Foundation by email, phone, WhatsApp or the enquiry form.",
      },
      { property: "og:title", content: "Contact · Navi Zindagi Foundation" },
    ],
  }),
});

function ContactPage() {
  const { settings } = Route.useLoaderData();
  const { t } = useLanguage();
  usePageSeo(t("seo.contactTitle"), t("seo.contactDescription"));

  return (
    <>
      <PageHero
        eyebrow={t("contact.eyebrow")}
        title={t("contact.title")}
        lead={t("contact.lead")}
        image="/facebook-cover.jpg"
        imageAlt={t("nav.logoAlt")}
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-display text-xl text-navy">{t("contact.official")}</h2>
            <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 text-teal" />
                {settings.address || t("contact.addressMissing")}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 text-teal" />
                {settings.phone || t("contact.phoneMissing")}
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 text-teal" />
                {settings.email ? (
                  <a className="text-teal-dark underline" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                ) : (
                  t("contact.emailMissing")
                )}
              </li>
            </ul>
            {settings.whatsapp ? (
              <a
                className="mt-5 inline-flex min-h-11 items-center rounded-full bg-teal px-5 text-sm font-semibold text-primary-foreground"
                href={whatsappHref(settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
              >
                {t("common.whatsapp")}
              </a>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">{t("contact.whatsappMissing")}</p>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-card">
            {settings.mapsEmbedUrl ? (
              <iframe
                title={t("contact.map")}
                src={settings.mapsEmbedUrl}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="grid h-72 place-items-center px-6 text-center text-sm text-muted-foreground">
                {t("contact.mapMissing")}
              </div>
            )}
          </div>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
