import { Link, createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { CtaBand } from "@/components/cta-band";
import { ImpactCard } from "@/components/impact-card";
import { Section } from "@/components/section";
import { TrustBar } from "@/components/trust-bar";
import { UpdateCard } from "@/components/update-card";
import { Button } from "@/components/ui/button";
import { StatTile } from "@/components/stat-tile";
import { APP_DESCRIPTION, APP_TITLE, RELIEF_CATEGORIES, SITE_URL, displayTagline } from "@/lib/site";
import { getPublicSite } from "@/lib/server/site";
import { Prose } from "@/components/prose";

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

function HomePage() {
  const { settings, campaigns, updates, reports } = Route.useLoaderData();
  const nepal = campaigns.find((campaign) => campaign.slug === "nepal-flood-relief");
  const assam = campaigns.find((campaign) => campaign.slug === "assam-flood-relief");
  const featured = [nepal, assam].filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign));
  const shown = featured.length >= 2 ? featured : campaigns.filter((campaign) => campaign.slug !== "general-relief").slice(0, 2);

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <img
          src="/hero-banner.jpg"
          alt="Flood-affected community receiving humanitarian support"
          width={1600}
          height={900}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <div className="reveal max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-soft">
              {displayTagline(settings.tagline)}
            </p>
            <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl lg:text-6xl">
              Help communities affected by flooding in Nepal and Assam
            </h1>
            <p className="mt-5 text-base leading-relaxed text-cream/85 sm:text-lg">
              {settings.mission ||
                "Your support can help provide essential relief such as food, clean water, hygiene supplies, medical assistance and temporary shelter."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/donate" search={{ campaign: undefined }}>
                  Donate Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="cream">
                <Link to="/volunteer">Become a Volunteer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <TrustBar settings={settings} />

      <Section
        id="campaigns"
        eyebrow="Active campaigns"
        title="Nepal and Assam flood relief"
        lead="Choose a campaign to see its published situation notes, fundraising figures and relief priorities. Figures stay at “Updates coming soon” until the Foundation records them."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {shown.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to="/campaigns">View all campaigns</Link>
          </Button>
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="Our impact"
        title="Verified outcomes, when they are ready"
        lead="This section does not display estimates. When field reports are confirmed they will replace the placeholders."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Families reached" value="Updates coming soon" />
          <StatTile label="Relief kits" value="Updates coming soon" />
          <StatTile label="Communities supported" value="Updates coming soon" />
        </div>
      </Section>

      <Section
        id="what-we-do"
        eyebrow="What we do"
        title="Where gifts can go"
        lead="Funds raised through this appeal are intended for emergency relief in the categories below. Exact allocation is published on the Transparency page as reports become available."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RELIEF_CATEGORIES.map((item) => (
            <ImpactCard key={item.key} title={item.title} body={item.body} image={item.image} />
          ))}
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="How your support helps"
        title="Accountable use of donations"
        lead="Donations are directed to the campaign you choose. Utilisation details are published as reports become available."
      >
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-6 shadow-card sm:p-8">
          <Prose text={settings.howDonationsUsed} />
          <Button asChild variant="outline" className="mt-6">
            <Link to="/transparency">Read how donations are used</Link>
          </Button>
        </div>
      </Section>

      <Section eyebrow="Latest campaign updates" title="What has been published">
        {updates.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Timeline: Updates coming soon. Situation reports will appear here when they are verified.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {updates.slice(0, 4).map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>
        )}
      </Section>

      <Section
        tone="cream"
        eyebrow="Transparency"
        title="Registered organisation information"
        lead="Operational claims stay limited to information the Foundation has confirmed and published."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-2xl text-navy">{settings.orgName}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{settings.aboutText}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/about">About the Foundation</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <ShieldCheck className="size-4 text-teal" />
              Registration and reports
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">CIN</dt>
                <dd className="font-medium text-navy">{settings.registrationCin || "To be updated"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Registered office</dt>
                <dd className="font-medium text-navy">{settings.address || "To be updated"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">80G / tax exemption</dt>
                <dd className="text-muted-foreground">{settings.registrationNotes || "To be updated"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Published reports</dt>
                <dd className="font-medium text-navy">
                  {reports.length > 0 ? `${reports.length} document${reports.length === 1 ? "" : "s"}` : "To be updated"}
                </dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/transparency">View transparency</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="navy">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-soft">Volunteer</p>
            <h2 className="mt-3 font-display text-3xl text-cream sm:text-4xl">
              Offer time, skills and coordination
            </h2>
            <p className="mt-4 text-base leading-relaxed text-cream/80">
              Volunteers help with fundraising, logistics, communications and community
              coordination. Register your skills and availability — a team member will follow up.
              Placement is never guaranteed from the form alone.
            </p>
            <Button asChild size="lg" variant="cream" className="mt-6">
              <Link to="/volunteer">
                <Users className="size-4" />
                Become a Volunteer
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-navy-mid p-6 text-cream/90">
            <p className="flex items-center gap-2 font-semibold">
              <HeartHandshake className="size-5 text-teal-soft" />
              How we work
            </p>
            <p className="mt-3 text-sm leading-relaxed text-cream/75">
              Navi Zindagi Foundation raises funds and volunteer capacity for verified flood-relief
              needs. This website does not claim that the Foundation is physically operating in a
              named location until that is documented in an official update.
            </p>
          </div>
        </div>
      </Section>

      <CtaBand
        eyebrow="Donate"
        title="Stand with flood-affected families today"
        lead="Choose Nepal Flood Relief, Assam Flood Relief, or General Relief. A donation is marked successful only after gateway verification."
        actions={
          <>
            <Button asChild size="lg">
              <Link to="/donate" search={{ campaign: undefined }}>
                Donate Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="cream">
              <Link to="/contact">Contact the Foundation</Link>
            </Button>
          </>
        }
      />
    </>
  );
}
