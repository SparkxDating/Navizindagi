import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { useLanguage, usePageSeo } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy Policy · Navi Zindagi Foundation" }] }),
});

function PrivacyPage() {
  const { t } = useLanguage();
  usePageSeo(t("seo.privacyTitle"));
  return (
    <LegalPage title={t("legal.privacyTitle")} updated={t("legal.updatedDate")}>
      <p>{t("legal.privacy1")}</p>
      <p>{t("legal.privacy2")}</p>
      <p>{t("legal.privacy3")}</p>
      <p>{t("legal.privacy4")}</p>
      <p>{t("legal.privacy5")}</p>
    </LegalPage>
  );
}
