import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/campaigns", label: "Campaigns" },
  { to: "/admin/donations", label: "Donations" },
  { to: "/admin/volunteers", label: "Volunteers" },
  { to: "/admin/enquiries", label: "Enquiries" },
  { to: "/admin/updates", label: "Updates" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/team", label: "Team" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/settings", label: "Settings" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-navy text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="" className="size-9 rounded-full object-cover" />
            <span className="font-display text-lg">Admin</span>
          </Link>
          <div className="text-cream [&_span]:text-cream [&_button]:text-cream/80">
            <UserButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav
          className="flex gap-2 overflow-x-auto pb-1 lg:w-52 lg:flex-col lg:overflow-visible"
          aria-label="Admin"
        >
          {LINKS.map((link) => {
            const active = "exact" in link && link.exact ? pathname === link.to : pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "shrink-0 rounded-full px-3 py-2 text-sm font-medium",
                  active ? "bg-navy text-cream" : "bg-card text-navy hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
