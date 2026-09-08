import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { EnsureLanguage, useLanguage, usePageSeo } from "@/lib/i18n";

export function NotFoundPage() {
  return (
    <EnsureLanguage>
      <NotFoundBody />
    </EnsureLanguage>
  );
}

function NotFoundBody() {
  const { t } = useLanguage();
  usePageSeo(t("seo.notFoundTitle"));
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-dark">404</p>
      <h1 className="mt-3 font-display text-4xl text-navy">{t("notFound.title")}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t("notFound.body")}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link to="/">{t("common.home")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/donate" search={{ campaign: undefined }}>
            {t("common.donate")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
