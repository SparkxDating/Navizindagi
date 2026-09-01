import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/section";
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
    ],
  }),
});

function ContactPage() {
  const { settings } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We welcome your questions"
        lead="Use the form for general enquiries. For faster contact, call or message the published numbers."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-display text-xl text-navy">Official details</h2>
            <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 text-teal" />
                {settings.address || "Address: To be updated"}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 text-teal" />
                {settings.phone || "Phone: To be updated"}
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 text-teal" />
                {settings.email ? (
                  <a className="text-teal-dark underline" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                ) : (
                  "Email: To be updated"
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
                WhatsApp
              </a>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">WhatsApp: To be updated</p>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-card">
            {settings.mapsEmbedUrl ? (
              <iframe
                title="Map"
                src={settings.mapsEmbedUrl}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="grid h-72 place-items-center px-6 text-center text-sm text-muted-foreground">
                Google Maps embed: To be updated. Add a maps embed URL in admin settings.
              </div>
            )}
          </div>
        </div>
        <ContactForm />
      </div>
    </>
  );
}
