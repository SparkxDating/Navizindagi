import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, Printer, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dateLocale, displayCampaignTitle, localizeDb, useLanguage, usePageSeo } from "@/lib/i18n";
import { getDonationReceipt } from "@/lib/server/site";
import { APP_NAME, SITE_URL, displayTagline } from "@/lib/site";
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

function ThankYouPage() {
  const { donation, settings } = Route.useLoaderData();
  const { t, language } = useLanguage();
  const locale = dateLocale(language);
  usePageSeo(t("seo.thankYouTitle"));

  function statusLabel(status: string) {
    if (status === "completed") return t("thankYou.verified");
    if (status === "sandbox") return t("thankYou.sandboxStatus");
    if (status === "failed") return t("thankYou.failed");
    return status;
  }

  if (!donation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-navy">{t("thankYou.notFound")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("thankYou.notFoundBody")}</p>
        <Button asChild className="mt-6">
          <Link to="/donate" search={{ campaign: undefined }}>
            {t("thankYou.backDonate")}
          </Link>
        </Button>
      </div>
    );
  }

  const success = donation.status === "completed" || donation.status === "sandbox";
  const campaignTitle = displayCampaignTitle(language, donation.campaignSlug, donation.campaignTitle);

  function receiptText() {
    if (!donation) return "";
    return [
      settings?.orgName ?? APP_NAME,
      t("thankYou.fileNote"),
      "",
      `${t("thankYou.reference")}: ${donation.referenceId}`,
      `${t("thankYou.campaign")}: ${campaignTitle}`,
      `${t("thankYou.amount")}: ${formatINR(donation.amount, locale)}`,
      `${t("thankYou.status")}: ${statusLabel(donation.status)}`,
      `${t("thankYou.date")}: ${formatDate(donation.createdAt, locale)}`,
      "",
      t("thankYou.fileDisclaimer"),
    ].join("\n");
  }

  async function shareSupport() {
    const text = t("thankYou.shareText");
    const url = `${SITE_URL}/donate`;
    if (navigator.share) {
      try {
        await navigator.share({ title: settings?.orgName ?? APP_NAME, text, url });
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
            <p className="text-sm text-muted-foreground">
              {settings?.tagline ? localizeDb(language, displayTagline(settings.tagline)) : ""}
            </p>
          </div>
        </div>
        <h1 className="mt-8 font-display text-3xl text-navy sm:text-4xl">
          {success ? t("thankYou.success") : t("thankYou.notConfirmed")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {success
            ? donation.status === "sandbox"
              ? t("thankYou.sandboxAck")
              : t("thankYou.verifiedAck")
            : t("thankYou.currentStatus", { status: donation.status })}
        </p>

        <dl className="mt-8 grid gap-4 rounded-xl bg-cream p-5 text-sm">
          <Row label={t("thankYou.reference")} value={donation.referenceId} />
          <Row label={t("thankYou.campaign")} value={campaignTitle} />
          <Row label={t("thankYou.amount")} value={formatINR(donation.amount, locale)} />
          <Row label={t("thankYou.status")} value={statusLabel(donation.status)} />
          <Row label={t("thankYou.date")} value={formatDate(donation.createdAt, locale)} />
        </dl>

        <div className="mt-6 rounded-xl border border-border p-4 text-sm text-muted-foreground">
          <p className="font-medium text-navy">{t("thankYou.ackTitle")}</p>
          <p className="mt-2">{t("thankYou.ackBody")}</p>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">{t("thankYou.emailTodo")}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 no-print sm:flex-row sm:flex-wrap">
        <Button type="button" onClick={() => window.print()}>
          <Printer className="size-4" />
          {t("thankYou.print")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => downloadTextFile(`nzf-acknowledgement-${donation.referenceId}.txt`, receiptText())}
        >
          <Download className="size-4" />
          {t("thankYou.download")}
        </Button>
        <Button type="button" variant="outline" onClick={() => void shareSupport()}>
          <Share2 className="size-4" />
          {t("thankYou.share")}
        </Button>
        <Button asChild variant="navy">
          <Link to="/">{t("thankYou.backHome")}</Link>
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
