import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useLanguage, usePageSeo } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms of Use · Navi Zindagi Foundation" }] }),
});

function TermsPage() {
  const { t } = useLanguage();
  usePageSeo(t("seo.termsTitle"));
  return (
    <LegalPage title={t("legal.termsTitle")} updated={t("legal.updatedDate")}>
      <p>{t("legal.terms1")}</p>
      <p>{t("legal.terms2")}</p>
      <p>{t("legal.terms3")}</p>
      <p>{t("legal.terms4")}</p>
    </LegalPage>
  );
}
