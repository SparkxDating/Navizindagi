import { Link } from "@tanstack/react-router";
import { Facebook, Instagram } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
    <path
      fill="currentColor"
      d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L4.9 22H1.64l8.02-9.16L1.5 2h6.76l4.66 6.18L18.244 2zm-1.16 18.16h1.81L7.01 3.74H5.07l12.014 16.42z"
    />
  </svg>
);

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const org = settings?.orgName ?? "Navi Zindagi Foundation";
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="" className="size-12 rounded-full object-cover" />
            <div>
              <p className="font-display text-xl text-cream">{org}</p>
              <p className="text-sm text-cream/70">{settings?.tagline ?? "Empower. Elevate. Transform."}</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/70">
            Fundraising and volunteer mobilisation for verified flood-relief efforts in Nepal and
            Assam. We publish what is confirmed, and label the rest as still to be updated.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/about" className="text-cream/80 hover:text-cream">
                About the Foundation
              </Link>
            </li>
            <li>
              <Link to="/campaigns" className="text-cream/80 hover:text-cream">
                Campaigns
              </Link>
            </li>
            <li>
              <Link to="/transparency" className="text-cream/80 hover:text-cream">
                Transparency
              </Link>
            </li>
            <li>
              <Link to="/volunteer" className="text-cream/80 hover:text-cream">
                Volunteer
              </Link>
            </li>
            <li>
              <Link to="/donate" search={{ campaign: undefined }} className="text-cream/80 hover:text-cream">
                Donate
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-cream/80 hover:text-cream">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">Policies</p>
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
