import { createFileRoute } from "@tanstack/react-router";
import { VolunteerForm } from "@/components/volunteer-form";
import { PageHero } from "@/components/section";

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
    ],
  }),
});

function VolunteerPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Offer your time with care"
        lead="Tell us your skills, city and availability. A team member will follow up. Submitting this form is not a placement, a job offer, or a guarantee of field deployment."
        image="/relief-shelter.jpg"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-display text-xl text-navy">Who we need</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>People who can help with donor outreach and fundraising.</li>
              <li>Coordinators for logistics and community contact.</li>
              <li>Those with medical, translation or administrative skills.</li>
              <li>Remote volunteers who can give a few hours a week.</li>
            </ul>
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
