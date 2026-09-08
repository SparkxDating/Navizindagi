import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { localizeDb, useLanguage, type MessageKey } from "@/lib/i18n";
import { APP_NAME, NAV_LINKS, displayTagline } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Navbar({ orgName, tagline }: { orgName?: string; tagline?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { t, language } = useLanguage();
  const name = orgName || APP_NAME;

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          <img
            src="/logo.jpg"
            alt={t("nav.logoAlt")}
            width={44}
            height={44}
            className="size-10 rounded-full object-cover sm:size-11"
          />
          <span className="min-w-0">
            <span className="block truncate font-display text-base leading-tight text-navy sm:text-lg">
              {name}
            </span>
            <span className="hidden text-[11px] tracking-wide text-muted-foreground sm:block">
              {localizeDb(language, displayTagline(tagline))}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t("nav.primary")}>
          {NAV_LINKS.map((link) => {
            const active =
              link.id === "work"
                ? false
                : link.to === "/"
                  ? pathname === "/" && link.id === "home"
                  : pathname === link.to;
            return (
              <Link
                key={`${link.to}-${link.id}`}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                className={cn(
                  "rounded-full px-2.5 py-2 text-sm font-medium transition-colors",
                  active ? "bg-teal-soft text-teal-dark" : "text-navy/80 hover:bg-muted hover:text-navy",
                )}
              >
                {t(`nav.${link.id}` as MessageKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <Button asChild size="sm" className="min-h-11 px-4 sm:min-h-11 sm:px-5">
            <Link to="/donate" search={{ campaign: undefined }} onClick={() => setOpen(false)}>
              {t("nav.donate")}
            </Link>
          </Button>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-navy lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-border bg-paper px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label={t("nav.mobile")}>
            {NAV_LINKS.map((link) => (
              <Link
                key={`${link.to}-${link.id}`}
                to={link.to}
                hash={"hash" in link ? link.hash : undefined}
                className="rounded-xl px-3 py-3 text-sm font-medium text-navy hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {t(`nav.${link.id}` as MessageKey)}
              </Link>
            ))}
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            <Button asChild className="mt-2 min-h-12">
              <Link to="/donate" search={{ campaign: undefined }} onClick={() => setOpen(false)}>
                {t("nav.donate")}
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
