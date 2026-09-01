import { Link, createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDonationReceipt } from "@/lib/server/site";
import { formatDate, formatINR } from "@/lib/utils";

export const Route = createFileRoute("/donate_/thank-you")({
  validateSearch: (search: Record<string, unknown>): { ref?: string } => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  loaderDeps: ({ search }) => ({ ref: search.ref }),
  loader: async ({ deps }) => {
    if (!deps.ref) return { donation: null, settings: null };
    return getDonationReceipt({ data: { referenceId: deps.ref } });
  },
  component: ThankYouPage,
  head: () => ({
    meta: [{ title: "Donation acknowledgement · Navi Zindagi Foundation" }],
  }),
});

function ThankYouPage() {
  const { donation, settings } = Route.useLoaderData();

  if (!donation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-navy">Receipt not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We could not find a donation for that reference. If you just paid, wait a moment and
          return from the checkout screen.
        </p>
        <Button asChild className="mt-6">
          <Link to="/donate" search={{ campaign: undefined }}>
            Back to donate
          </Link>
        </Button>
      </div>
    );
  }

  const success = donation.status === "completed" || donation.status === "sandbox";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl bg-card p-6 shadow-card sm:p-10" id="receipt">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="" className="size-14 rounded-full object-cover" />
          <div>
            <p className="font-display text-xl text-navy">{settings?.orgName}</p>
            <p className="text-sm text-muted-foreground">{settings?.tagline}</p>
          </div>
        </div>
        <h1 className="mt-8 font-display text-3xl text-navy">
          {success ? "Thank you for your support" : "Payment not confirmed"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {success
            ? donation.status === "sandbox"
              ? "This is a sandbox acknowledgement. No live payment was collected. It must not be treated as funds received."
              : "Your payment was verified with the gateway. Please save this acknowledgement."
            : `Current status: ${donation.status}. A donation is only treated as successful after gateway verification.`}
        </p>

        <dl className="mt-8 grid gap-4 rounded-xl bg-cream p-5 text-sm">
          <Row label="Amount" value={formatINR(donation.amount)} />
          <Row label="Campaign" value={donation.campaignTitle} />
          <Row label="Reference" value={donation.referenceId} />
          <Row label="Date" value={formatDate(donation.createdAt)} />
          <Row
            label="Donor"
            value={donation.isAnonymous ? "Anonymous" : donation.donorName}
          />
          <Row label="Email" value={donation.email} />
          <Row label="Status" value={donation.status} />
        </dl>

        <div className="mt-6 rounded-xl border border-border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-navy">Email confirmation</p>
          <p className="mt-2">
            A copy of this acknowledgement should be sent to {donation.email}. TODO: connect a
            transactional email provider on the server to dispatch receipts automatically. Until
            then, please download or print this page.
          </p>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tax-exemption certificates (such as 80G) are listed only when the Foundation has published
          them. Until then, treat tax deductibility as “To be updated”.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 no-print sm:flex-row">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          Download / print receipt
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}
