import { createFileRoute } from "@tanstack/react-router";
import { Prose } from "@/components/prose";
import { PageHero, Section } from "@/components/section";
import { ProgressBar } from "@/components/ui/progress";
import { getPublicSite } from "@/lib/server/site";
import { formatDate, formatINR } from "@/lib/utils";

export const Route = createFileRoute("/transparency")({
  loader: () => getPublicSite(),
  component: TransparencyPage,
  head: () => ({
    meta: [
      { title: "Transparency · Navi Zindagi Foundation" },
      {
        name: "description",
        content:
          "How Navi Zindagi Foundation uses flood-relief donations, campaign utilisation, reports and FAQs.",
      },
    ],
  }),
});

function TransparencyPage() {
  const { settings, campaigns, faqs, reports } = Route.useLoaderData();

  return (
    <>
      <PageHero
        eyebrow="Accountability"
        title="How donations are used"
        lead="Figures and reports on this page are editable from the admin dashboard. Until a report is published, treat numbers as still to be updated."
      />
      <Section>
        <Prose className="mx-auto max-w-3xl" text={settings.howDonationsUsed} />
      </Section>
      <Section tone="cream" title="Campaign-wise fund utilisation">
        <div className="grid gap-5">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-2xl bg-card p-6 shadow-card">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h3 className="font-display text-2xl text-navy">{campaign.title}</h3>
                <p className="text-sm tabular-nums text-navy">
                  {campaign.amountRaised > 0 || campaign.targetAmount > 0
                    ? `${formatINR(campaign.amountRaised)} raised`
                    : "Updates coming soon"}
                </p>
              </div>
              <ProgressBar className="mt-4" raised={campaign.amountRaised} target={campaign.targetAmount} />
              <p className="mt-4 text-sm text-muted-foreground">{campaign.utilisationNotes}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section title="Reports and documents">
        {reports.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Reports and documents: To be updated. Utilisation statements will be listed here when
            the Foundation publishes them.
          </p>
        ) : (
          <ul className="mx-auto max-w-3xl space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded-2xl bg-card p-5 shadow-card">
                <p className="font-semibold text-navy">{report.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {report.description || "To be updated"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(report.publishedAt)}</p>
                {report.url ? (
                  <a href={report.url} className="mt-2 inline-block text-sm font-medium text-teal-dark underline">
                    Open document
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section tone="cream" title="Donation and payment information">
        <Prose className="mx-auto max-w-3xl" text={settings.paymentInfo} />
      </Section>
      <Section title="Frequently asked questions">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details key={faq.id} className="rounded-2xl bg-card p-5 shadow-card">
              <summary className="cursor-pointer font-semibold text-navy">{faq.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
