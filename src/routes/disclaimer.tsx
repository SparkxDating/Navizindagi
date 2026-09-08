import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useLanguage, usePageSeo } from "@/lib/i18n";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerPage,
  head: () => ({ meta: [{ title: "Disclaimer · Navi Zindagi Foundation" }] }),
});

function DisclaimerPage() {
  const { t } = useLanguage();
  usePageSeo(t("seo.disclaimerTitle"));
  return (
    <LegalPage title={t("legal.disclaimerTitle")} updated={t("legal.updatedDate")}>
      <p>{t("legal.disclaimer1")}</p>
      <p>{t("legal.disclaimer2")}</p>
      <p>{t("legal.disclaimer3")}</p>
      <p>{t("legal.disclaimer4")}</p>
    </LegalPage>
  );
}
