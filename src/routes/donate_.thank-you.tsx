import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDonationReceipt } from "@/lib/server/site";
import { SITE_URL } from "@/lib/site";
import { downloadTextFile, formatDate, formatINR } from "@/lib/utils";

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
    links: [{ rel: "canonical", href: `${SITE_URL}/donate/thank-you` }],
  }),
});

function statusLabel(status: string) {
  if (status === "completed") return "Verified payment";
  if (status === "sandbox") return "Sandbox acknowledgement (not a live payment)";
  if (status === "failed") return "Payment not confirmed";
  return status;
}

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

  function receiptText() {
    if (!donation) return "";
    return [
      settings?.orgName ?? "Navi Zindagi Foundation",
      "Payment acknowledgement — not a tax-exemption certificate",
      "",
      `Reference: ${donation.referenceId}`,
      `Campaign: ${donation.campaignTitle}`,
      `Amount: ${formatINR(donation.amount)}`,
      `Status: ${statusLabel(donation.status)}`,
      `Date: ${formatDate(donation.createdAt)}`,
      `Donor: ${donation.isAnonymous ? "Anonymous" : donation.donorName}`,
      `Email: ${donation.email}`,
      "",
      "This is a payment acknowledgement. It is not an 80G or tax-exemption certificate unless the Foundation has separately issued one.",
    ].join("\n");
  }

  async function shareSupport() {
    const text = "I'm supporting flood relief with Navi Zindagi Foundation.";
    const url = `${SITE_URL}/donate`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Navi Zindagi Foundation", text, url });
        return;
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
  }

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
        <h1 className="mt-8 font-display text-3xl text-navy sm:text-4xl">
          {success ? "Thank You for Supporting Flood Relief" : "Payment not confirmed"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {success
            ? donation.status === "sandbox"
              ? "This is a sandbox acknowledgement. No live payment was collected. It must not be treated as funds received."
              : "Your payment was verified with the gateway. Please save this acknowledgement."
            : `Current status: ${donation.status}. A donation is only treated as successful after gateway verification.`}
        </p>

        <dl className="mt-8 grid gap-4 rounded-xl bg-cream p-5 text-sm">
          <Row label="Donation reference" value={donation.referenceId} />
          <Row label="Campaign" value={donation.campaignTitle} />
          <Row label="Amount" value={formatINR(donation.amount)} />
          <Row label="Payment status" value={statusLabel(donation.status)} />
          <Row label="Date" value={formatDate(donation.createdAt)} />
          <Row label="Donor" value={donation.isAnonymous ? "Anonymous" : donation.donorName} />
          <Row label="Email" value={donation.email} />
        </dl>

        <div className="mt-6 rounded-xl border border-border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-navy">This is a payment acknowledgement</p>
          <p className="mt-2">
            It confirms the payment status recorded by this website. It is not a tax-exemption
            certificate (including 80G) and should not be used as one unless the Foundation has
            published verified tax documents separately.
          </p>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          TODO: connect a transactional email provider on the server to dispatch receipts
          automatically. Until then, please download or print this page.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 no-print sm:flex-row sm:flex-wrap">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print receipt
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(`nzf-acknowledgement-${donation.referenceId}.txt`, receiptText())}
        >
          <Download className="size-4" />
          Download acknowledgement
        </Button>
        <Button type="button" variant="outline" onClick={() => void shareSupport()}>
          <Share2 className="size-4" />
          Share this cause
        </Button>
        <Button asChild variant="navy">
          <Link to="/">Back to homepage</Link>
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
