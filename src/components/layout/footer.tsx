import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { displayCampaignTitle, localizeDb, useLanguage } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/types";
import { APP_NAME, displayTagline } from "@/lib/site";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path
      fill="currentColor"
      d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L4.9 22H1.64l8.02-9.16L1.5 2h6.76l4.66 6.18L18.244 2zm-1.16 18.16h1.81L7.01 3.74H5.07l12.014 16.42z"
    />
  </svg>
);

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const { t, language, tValue } = useLanguage();
  const org = settings?.orgName ?? APP_NAME;
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-10 lg:py-14">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt={t("nav.logoAlt")} width={48} height={48} className="size-12 rounded-full object-cover" />
            <div>
              <p className="font-display text-xl text-cream">{org}</p>
              <p className="text-sm text-cream/70">{localizeDb(language, displayTagline(settings?.tagline))}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            {tValue({ en: settings?.mission, hi: null }) || t("footer.fallbackMission")}
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">{t("footer.contact")}</p>
          <ul className="mt-3 space-y-3 text-sm text-cream/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-soft" aria-hidden />
              <span>{settings?.address || t("footer.addressMissing")}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-teal-soft" aria-hidden />
              <span>{settings?.phone || t("footer.phoneMissing")}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-teal-soft" aria-hidden />
              {settings?.email ? (
                <a className="break-all hover:text-cream" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              ) : (
                <span>{t("footer.emailMissing")}</span>
              )}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">{t("footer.about")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-cream/80 hover:text-cream">
                {t("footer.ourStory")}
              </Link>
            </li>
            <li>
              <Link to="/about" hash="what-we-do" className="text-cream/80 hover:text-cream">
                {t("footer.whatWeDo")}
              </Link>
            </li>
            <li>
              <Link to="/transparency" className="text-cream/80 hover:text-cream">
                {t("nav.transparency")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-cream/80 hover:text-cream">
                {t("footer.contact")}
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">{t("footer.campaigns")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/campaign/$slug" params={{ slug: "nepal-flood-relief" }} className="text-cream/80 hover:text-cream">
                {displayCampaignTitle(language, "nepal-flood-relief", "Nepal Flood Relief")}
              </Link>
            </li>
            <li>
              <Link to="/campaign/$slug" params={{ slug: "assam-flood-relief" }} className="text-cream/80 hover:text-cream">
                {displayCampaignTitle(language, "assam-flood-relief", "Assam Flood Relief")}
              </Link>
            </li>
            <li>
              <Link to="/campaigns" className="text-cream/80 hover:text-cream">
                {t("footer.allCampaigns")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">{t("footer.involved")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/donate" search={{ campaign: undefined }} className="text-cream/80 hover:text-cream">
                {t("common.donate")}
              </Link>
            </li>
            <li>
              <Link to="/volunteer" className="text-cream/80 hover:text-cream">
                {t("nav.volunteer")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">{t("footer.legal")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="text-cream/80 hover:text-cream">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-cream/80 hover:text-cream">
                {t("footer.terms")}
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="text-cream/80 hover:text-cream">
                {t("footer.refund")}
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="text-cream/80 hover:text-cream">
                {t("footer.disclaimer")}
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-cream/80 hover:text-cream">
                {t("footer.admin")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {org}. {t("common.allRights")}
          </p>
          <div className="flex items-center gap-3">
            {settings?.facebookUrl ? (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label={t("common.facebook")} className="rounded-full p-2 hover:bg-cream/10">
                <Facebook className="size-4" />
              </a>
            ) : null}
            {settings?.instagramUrl ? (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label={t("common.instagram")} className="rounded-full p-2 hover:bg-cream/10">
                <Instagram className="size-4" />
              </a>
            ) : null}
            {settings?.twitterUrl ? (
              <a href={settings.twitterUrl} target="_blank" rel="noreferrer" aria-label={t("common.x")} className="rounded-full p-2 hover:bg-cream/10">
                <XIcon />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
