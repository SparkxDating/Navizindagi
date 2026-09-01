import { Link, createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { ImpactCard } from "@/components/impact-card";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { StatTile } from "@/components/stat-tile";
import { RELIEF_CATEGORIES } from "@/lib/site";
import { getPublicSite } from "@/lib/server/site";
import { formatINR } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => getPublicSite(),
  component: HomePage,
  head: () => ({
    meta: [{ title: "Navi Zindagi Foundation · Stand With Flood-Affected Families" }],
  }),
});

function HomePage() {
  const { settings, campaigns } = Route.useLoaderData();
  const featured = campaigns.filter((campaign) => campaign.isFeatured).slice(0, 2);
  const shown = featured.length >= 2 ? featured : campaigns.slice(0, 2);

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        <img
          src="/hero-banner.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy/85 to-navy/55" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="reveal max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {settings.tagline}
            </p>
            <h1 className="mt-4 font-display text-4xl text-cream sm:text-5xl lg:text-6xl">
              Stand With Flood-Affected Families
            </h1>
            <p className="mt-5 text-base leading-relaxed text-cream/80 sm:text-lg">
              Donations to Navi Zindagi Foundation support verified flood-relief efforts in Nepal
              and Assam — food, clean water, hygiene supplies, medical support, temporary shelter
              and essential household items. We publish confirmed information and label the rest as
              still to be updated.
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
          <div className="grid gap-4">
            {shown.map((campaign) => (
              <div key={campaign.id} className="rounded-2xl bg-card/95 p-5 shadow-card backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">
                  {campaign.locationLabel}
                </p>
                <h2 className="mt-1 font-display text-2xl text-navy">{campaign.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{campaign.shortDescription}</p>
                <ProgressBar className="mt-4" raised={campaign.amountRaised} target={campaign.targetAmount} />
                <Button asChild className="mt-4 w-full">
                  <Link to="/campaign/$slug" params={{ slug: campaign.slug }}>
                    View campaign
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section
        eyebrow="Campaigns"
        title="Nepal and Assam flood relief"
        lead="Choose a campaign to see its published situation notes, fundraising figures and relief priorities. Figures stay at “Updates coming soon” until the Foundation records them."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {shown.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="Progress"
        title="Donation progress"
        lead="Totals below combine verified completed payments with any amounts the Foundation has published in the admin area. Sandbox/test payments are excluded."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns
            .filter((campaign) => campaign.slug !== "general-relief" || campaign.amountRaised > 0)
            .map((campaign) => (
              <div key={campaign.id} className="rounded-2xl bg-card p-5 shadow-card">
                <h3 className="font-display text-xl text-navy">{campaign.title}</h3>
                <p className="mt-3 font-display text-2xl tabular-nums text-navy">
                  {campaign.amountRaised > 0 || campaign.targetAmount > 0
                    ? formatINR(campaign.amountRaised)
                    : "Updates coming soon"}
                </p>
                <ProgressBar className="mt-3" raised={campaign.amountRaised} target={campaign.targetAmount} />
              </div>
            ))}
        </div>
      </Section>

      <Section
        eyebrow="Where gifts go"
        title="What donations can support"
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
        eyebrow="Impact"
        title="Verified outcomes, when they are ready"
        lead="This section does not display estimates. When field reports are confirmed they will replace the placeholders."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Families reached" value="Updates coming soon" />
          <StatTile label="Relief kits" value="Updates coming soon" />
          <StatTile label="Communities supported" value="Updates coming soon" />
        </div>
      </Section>

      <Section tone="navy">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Volunteer</p>
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
              <HeartHandshake className="size-5 text-gold" />
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

      <Section
        eyebrow="The Foundation"
        title="A registered Indian NGO"
        lead="Operational claims stay limited to information the Foundation has confirmed and published."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h3 className="font-display text-2xl text-navy">{settings.orgName}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{settings.aboutText}</p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/about">About the NGO</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <ShieldCheck className="size-4 text-teal" />
              Transparency
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
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="text-muted-foreground">{settings.registrationNotes || "To be updated"}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/transparency">View transparency</Link>
            </Button>
          </div>
        </div>
      </Section>

      <Section tone="cream" title="Need to reach us?">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl text-muted-foreground">
            {settings.address || "Address: To be updated"}
            {settings.email ? ` · ${settings.email}` : ""}
            {settings.phone ? ` · ${settings.phone}` : ""}
          </p>
          <Button asChild>
            <Link to="/contact">Contact the Foundation</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
