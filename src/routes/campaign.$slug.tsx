import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { CampaignCard } from "@/components/campaign-card";
import { BulletList, Prose } from "@/components/prose";
import { UpdateCard } from "@/components/update-card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { StatTile } from "@/components/stat-tile";
import { getCampaignPage } from "@/lib/server/site";
import { SITE_URL } from "@/lib/site";
import { formatINR } from "@/lib/utils";

export const Route = createFileRoute("/campaign/$slug")({
  loader: async ({ params }) => {
    const data = await getCampaignPage({ data: { slug: params.slug } });
    if (!data.campaign) throw notFound();
    return data;
  },
  component: CampaignPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.campaign?.title ?? "Campaign"} · Navi Zindagi Foundation`,
      },
      {
        name: "description",
        content: loaderData?.campaign?.shortDescription ?? "Flood relief campaign",
      },
      {
        property: "og:image",
        content: loaderData?.campaign?.heroImageUrl?.startsWith("http")
          ? loaderData.campaign.heroImageUrl
          : `${SITE_URL}${loaderData?.campaign?.heroImageUrl || "/og.jpg"}`,
      },
    ],
  }),
});

function CampaignPage() {
  const { campaign, updates, campaigns } = Route.useLoaderData();
  if (!campaign) return null;
  const others = campaigns.filter((item) => item.id !== campaign.id && item.slug !== "general-relief");
  const hasFigures = campaign.targetAmount > 0 || campaign.amountRaised > 0;

  return (
    <>
      <section className="relative overflow-hidden bg-navy">
        {campaign.heroImageUrl ? (
          <img src={campaign.heroImageUrl} alt="" className="absolute inset-0 size-full object-cover opacity-40" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy/80 to-navy/50" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{campaign.locationLabel}</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl text-cream sm:text-5xl">{campaign.title}</h1>
          <p className="mt-4 max-w-2xl text-base text-cream/80">{campaign.shortDescription}</p>
          <Button asChild size="lg" className="mt-8">
            <Link to="/donate" search={{ campaign: campaign.slug }}>
              Donate to this campaign
            </Link>
          </Button>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl text-navy">Situation</h2>
            <Prose className="mt-4" text={campaign.situationText} />
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">Mission for this appeal</h2>
            <Prose className="mt-4" text={campaign.missionText} />
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">Relief priorities</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {campaign.reliefPriorities.length === 0 ? (
                <li>To be updated</li>
              ) : (
                campaign.reliefPriorities.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" />
                    {item}
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl text-navy">Updates</h2>
            <div className="mt-4 space-y-4">
              {updates.length === 0 ? (
                <p className="rounded-2xl bg-cream p-5 text-sm text-muted-foreground">
                  Timeline: Updates coming soon. Situation reports will appear here when they are
                  verified.
                </p>
              ) : (
                updates.map((update) => <UpdateCard key={update.id} update={update} />)
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            {hasFigures ? (
              <>
                <StatTile
                  label="Amount raised"
                  value={formatINR(campaign.amountRaised)}
                  hint={
                    campaign.donorCount > 0
                      ? `${campaign.donorCount} verified donation${campaign.donorCount === 1 ? "" : "s"}`
                      : "Donor count: Updates coming soon"
                  }
                  className="shadow-none p-0"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Target: {campaign.targetAmount > 0 ? formatINR(campaign.targetAmount) : "To be updated"}
                </p>
                <ProgressBar className="mt-3" raised={campaign.amountRaised} target={campaign.targetAmount} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Fundraising figures: Updates coming soon</p>
            )}
            <Button asChild className="mt-5 w-full">
              <Link to="/donate" search={{ campaign: campaign.slug }}>
                Donate Now
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-cream p-6">
            <h2 className="font-display text-xl text-navy">Volunteer</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              If you can offer time or skills, register your interest. Placement is never automatic.
            </p>
            <Button asChild variant="navy" className="mt-4 w-full">
              <Link to="/volunteer">Become a Volunteer</Link>
            </Button>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-display text-xl text-navy">Fund utilisation</h2>
            <BulletList className="mt-3 text-sm" text={campaign.utilisationNotes} />
          </div>
        </aside>
      </div>

      {others.length > 0 ? (
        <section className="bg-cream px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl text-navy">Other campaigns</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {others.map((item) => (
                <CampaignCard key={item.id} campaign={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
