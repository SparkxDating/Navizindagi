import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useLanguage, usePageSeo } from "@/lib/i18n";

export const Route = createFileRoute("/refund-policy")({
  component: RefundPage,
  head: () => ({ meta: [{ title: "Donation & Refund Policy · Navi Zindagi Foundation" }] }),
});

function RefundPage() {
  const { t } = useLanguage();
  usePageSeo(t("seo.refundTitle"));
  return (
    <LegalPage title={t("legal.refundTitle")} updated={t("legal.updatedDate")}>
      <p>{t("legal.refund1")}</p>
      <p>{t("legal.refund2")}</p>
      <p>{t("legal.refund3")}</p>
      <p>{t("legal.refund4")}</p>
      <p>{t("legal.refund5")}</p>
    </LegalPage>
  );
}
