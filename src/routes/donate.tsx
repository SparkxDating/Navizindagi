import { createFileRoute } from "@tanstack/react-router";
import { DonationForm } from "@/components/donation-form";
import { PageHero } from "@/components/section";
import { getPaymentConfig } from "@/lib/server/payment";
import { getPublicSite } from "@/lib/server/site";

export const Route = createFileRoute("/donate")({
  validateSearch: (search: Record<string, unknown>): { campaign?: string } => ({
    campaign: typeof search.campaign === "string" ? search.campaign : undefined,
  }),
  loader: async () => {
    const [site, payment] = await Promise.all([getPublicSite(), getPaymentConfig()]);
    return { site, payment };
  },
  component: DonatePage,
  head: () => ({
    meta: [
      { title: "Donate · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "Donate to Nepal Flood Relief, Assam Flood Relief, or General Relief. Payments are marked successful only after gateway verification.",
      },
    ],
  }),
});

function DonatePage() {
  const { campaign } = Route.useSearch();
  const { site, payment } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Donate"
        title="Support verified flood relief"
        lead="Choose Nepal Flood Relief, Assam Flood Relief, or General Relief. Card and UPI details are handled by the payment gateway — this website does not store them."
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DonationForm
          campaigns={site.campaigns.filter((item) => item.isActive)}
          payment={payment}
          initialSlug={campaign}
          orgName={site.settings.orgName}
        />
        <aside className="space-y-5 lg:pt-2">
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-display text-xl text-navy">How this works</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Select a campaign and amount.</li>
              <li>Share your details for a receipt.</li>
              <li>Complete payment on the gateway checkout, or the labelled sandbox if live keys are not configured.</li>
              <li>A donation is recorded as successful only after server-side verification.</li>
            </ol>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="font-display text-xl text-navy">Payment information</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {site.settings.paymentInfo}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
