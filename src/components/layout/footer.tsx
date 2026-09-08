import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
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
  const org = settings?.orgName ?? APP_NAME;
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-10 lg:py-14">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt={`${org} logo`} width={48} height={48} className="size-12 rounded-full object-cover" />
            <div>
              <p className="font-display text-xl text-cream">{org}</p>
              <p className="text-sm text-cream/70">{displayTagline(settings?.tagline)}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/70">
            {settings?.mission ||
              "Fundraising and volunteer mobilisation for verified flood-relief efforts in Nepal and Assam."}
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">Contact</p>
          <ul className="mt-3 space-y-3 text-sm text-cream/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal-soft" aria-hidden />
              <span>{settings?.address || "Address: To be updated"}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-teal-soft" aria-hidden />
              <span>{settings?.phone || "Phone: To be updated"}</span>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-teal-soft" aria-hidden />
              {settings?.email ? (
                <a className="break-all hover:text-cream" href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              ) : (
                <span>Email: To be updated</span>
              )}
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-cream/80 hover:text-cream">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/about" hash="what-we-do" className="text-cream/80 hover:text-cream">
                What we do
              </Link>
            </li>
            <li>
              <Link to="/transparency" className="text-cream/80 hover:text-cream">
                Transparency
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-cream/80 hover:text-cream">
                Contact
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">Campaigns</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/campaign/$slug" params={{ slug: "nepal-flood-relief" }} className="text-cream/80 hover:text-cream">
                Nepal Flood Relief
              </Link>
            </li>
            <li>
              <Link to="/campaign/$slug" params={{ slug: "assam-flood-relief" }} className="text-cream/80 hover:text-cream">
                Assam Flood Relief
              </Link>
            </li>
            <li>
              <Link to="/campaigns" className="text-cream/80 hover:text-cream">
                All campaigns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">Get involved</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/donate" search={{ campaign: undefined }} className="text-cream/80 hover:text-cream">
                Donate
              </Link>
            </li>
            <li>
              <Link to="/volunteer" className="text-cream/80 hover:text-cream">
                Volunteer
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="text-cream/80 hover:text-cream">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-cream/80 hover:text-cream">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="text-cream/80 hover:text-cream">
                Donation & Refund Policy
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="text-cream/80 hover:text-cream">
                Disclaimer
              </Link>
            </li>
            <li>
              <Link to="/login" className="text-cream/80 hover:text-cream">
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-xs text-cream/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {org}. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {settings?.facebookUrl ? (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="rounded-full p-2 hover:bg-cream/10">
                <Facebook className="size-4" />
              </a>
            ) : null}
            {settings?.instagramUrl ? (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="rounded-full p-2 hover:bg-cream/10">
                <Instagram className="size-4" />
              </a>
            ) : null}
            {settings?.twitterUrl ? (
              <a href={settings.twitterUrl} target="_blank" rel="noreferrer" aria-label="X" className="rounded-full p-2 hover:bg-cream/10">
                <XIcon />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
