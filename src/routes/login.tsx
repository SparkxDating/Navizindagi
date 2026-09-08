import { Link, createFileRoute } from "@tanstack/react-router";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LoginForm } from "@/components/login-form";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, usePageSeo } from "@/lib/i18n";
import { APP_NAME } from "@/lib/site";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Admin sign in · Navi Zindagi Foundation" }],
  }),
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const { t } = useLanguage();
  usePageSeo(t("seo.loginTitle"));
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="flex items-center justify-between gap-3 px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.jpg" alt={t("nav.logoAlt")} className="size-10 rounded-full object-cover" />
          <span className="font-display text-lg text-navy">{APP_NAME}</span>
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
          <h1 className="font-display text-3xl text-navy">{t("login.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("login.lead")}</p>
          <div className="mt-6">
            {isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : user ? (
              <>
                <p className="text-sm text-muted-foreground">{t("login.signedIn")}</p>
                <Button asChild className="mt-4 w-full">
                  <Link to="/admin">{t("login.dashboard")}</Link>
                </Button>
              </>
            ) : (
              <LoginForm />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
