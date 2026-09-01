import { createFileRoute } from "@tanstack/react-router";
import { CampaignCard } from "@/components/campaign-card";
import { PageHero, Section } from "@/components/section";
import { getPublicSite } from "@/lib/server/site";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/campaigns")({
  loader: () => getPublicSite(),
  component: CampaignsPage,
  head: () => ({
    meta: [
      { title: "Campaigns · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "Donate to Nepal Flood Relief, Assam Flood Relief or General Relief with Navi Zindagi Foundation.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/campaigns` }],
  }),
});

function CampaignsPage() {
  const { campaigns } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Campaigns"
        title="Choose a flood-relief appeal"
        lead="Each campaign publishes its own situation notes, fundraising figures and updates. Figures stay at “Updates coming soon” until the Foundation records them."
        image="/facebook-cover.jpg"
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </Section>
    </>
  );
}
