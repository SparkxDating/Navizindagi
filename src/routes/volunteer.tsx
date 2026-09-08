import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Headphones, LifeBuoy, MapPin } from "lucide-react";
import { VolunteerForm } from "@/components/volunteer-form";
import { PageHero } from "@/components/section";
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
  {
    title: "Volunteer locally",
    body: "Help with community coordination, collections and local outreach where you live.",
    icon: MapPin,
  },
  {
    title: "Emergency response",
    body: "Offer on-call availability for logistics, first-aid support or rapid coordination.",
    icon: LifeBuoy,
  },
  {
    title: "Community support",
    body: "Support families through translation, dignity kits, and day-to-day coordination.",
    icon: HeartHandshake,
  },
  {
    title: "Online support",
    body: "Give a few hours a week remotely — fundraising, communications or administration.",
    icon: Headphones,
  },
] as const;

function VolunteerPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Offer your time with care"
        lead="Tell us your skills, city and availability. A team member will follow up. Submitting this form is not a placement, a job offer, or a guarantee of field deployment."
        image="/relief-shelter.jpg"
        imageAlt="Community shelter support"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {ROLES.map((role) => (
              <article key={role.title} className="rounded-2xl bg-card p-5 shadow-card">
                <p className="flex items-center gap-2 font-display text-lg text-navy">
                  <role.icon className="size-4 text-teal" aria-hidden />
                  {role.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{role.body}</p>
              </article>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            We will not claim that volunteers are deployed to a named location until that is
            documented in an official update.
          </p>
        </aside>
        <VolunteerForm />
      </div>
    </>
  );
}
