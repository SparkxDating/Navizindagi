import { createFileRoute } from "@tanstack/react-router";
import { CampaignCard } from "@/components/campaign-card";
import { PageHero, Section } from "@/components/section";
import { useLanguage, usePageSeo } from "@/lib/i18n";
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
      { property: "og:title", content: "Campaigns · Navi Zindagi Foundation" },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/campaigns` }],
  }),
});

function CampaignsPage() {
  const { campaigns } = Route.useLoaderData();
  const { t } = useLanguage();
  usePageSeo(t("seo.campaignsTitle"), t("seo.campaignsDescription"));

  return (
    <>
      <PageHero
        eyebrow={t("campaigns.eyebrow")}
        title={t("campaigns.title")}
        lead={t("campaigns.lead")}
        image="/facebook-cover.jpg"
        imageAlt={t("campaigns.title")}
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
