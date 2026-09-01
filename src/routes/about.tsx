import { createFileRoute } from "@tanstack/react-router";
import { BulletList, Prose } from "@/components/prose";
import { PageHero, Section } from "@/components/section";
import { getPublicSite } from "@/lib/server/site";

export const Route = createFileRoute("/about")({
  loader: () => getPublicSite(),
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "Learn about Navi Zindagi Foundation — mission, vision, values and flood-relief work. Unpublished details are labelled To be updated.",
      },
    ],
  }),
});

function AboutPage() {
  const { settings, team } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="About"
        title={settings.orgName}
        lead={settings.tagline}
        image="/facebook-cover.jpg"
      />
      <Section>
        <Prose text={settings.aboutText} className="mx-auto max-w-3xl" />
      </Section>
      <Section tone="cream" title="Mission, vision and values">
        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-xl text-navy">Mission</h3>
            <Prose className="mt-3 text-sm" text={settings.mission || "To be updated"} />
          </article>
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-xl text-navy">Vision</h3>
            <Prose className="mt-3 text-sm" text={settings.vision || "To be updated"} />
          </article>
          <article className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-xl text-navy">Core values</h3>
            <BulletList className="mt-3 text-sm" text={settings.valuesText || "To be updated"} />
          </article>
        </div>
      </Section>
      <Section title="Areas of work">
        <div className="mx-auto max-w-3xl">
          <BulletList text={settings.areasOfWork || "To be updated"} />
        </div>
      </Section>
      <Section tone="cream" title="Leadership">
        {team.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Leadership and team details: To be updated. Names will appear here when published by
            the Foundation.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <article key={member.id} className="rounded-2xl bg-card p-6 shadow-card">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt="" className="mb-4 size-20 rounded-full object-cover" />
                ) : (
                  <div className="mb-4 grid size-20 place-items-center rounded-full bg-teal-soft font-display text-2xl text-teal-dark">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-display text-xl text-navy">{member.name}</h3>
                <p className="text-sm font-medium text-teal-dark">{member.role || "To be updated"}</p>
                <p className="mt-2 text-sm text-muted-foreground">{member.bio || "To be updated"}</p>
              </article>
            ))}
          </div>
        )}
      </Section>
      <Section title="NGO registration">
        <dl className="mx-auto max-w-3xl space-y-4 rounded-2xl bg-card p-6 shadow-card text-sm">
          <div>
            <dt className="text-muted-foreground">Legal name</dt>
            <dd className="font-medium text-navy">{settings.orgName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">CIN</dt>
            <dd className="font-medium text-navy">{settings.registrationCin || "To be updated"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Registered office</dt>
            <dd className="font-medium text-navy">{settings.address || "To be updated"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Notes</dt>
            <dd className="text-muted-foreground">{settings.registrationNotes || "To be updated"}</dd>
          </div>
        </dl>
      </Section>
    </>
  );
}
