import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";
import { useAdminWorkspace } from "./admin-gate";

const LINKS = [
  { to: "/admin", label: "Overview", exact: true, show: "always" },
  { to: "/admin/campaigns", label: "Campaigns", show: "always" },
  { to: "/admin/donations", label: "Donations", show: "always" },
  { to: "/admin/volunteers", label: "Volunteers", show: "inbox" },
  { to: "/admin/enquiries", label: "Enquiries", show: "inbox" },
  { to: "/admin/updates", label: "Updates", show: "always" },
  { to: "/admin/reports", label: "Reports", show: "platform" },
  { to: "/admin/team", label: "Team", show: "platform" },
  { to: "/admin/faqs", label: "FAQs", show: "platform" },
  { to: "/admin/settings", label: "Settings", show: "platform" },
] as const;

function roleLabel(role: string) {
  if (role === "platform_admin") return "Platform admin";
  if (role === "campaign_manager") return "Campaign manager";
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "Viewer";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const workspace = useAdminWorkspace();
  const links = LINKS.filter((link) => {
    if (link.show === "inbox") return workspace.permissions.viewInbox;
    if (link.show === "platform") return workspace.permissions.platformSite;
    return true;
  });
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-navy text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img src="/logo.jpg" alt="" className="size-9 rounded-full object-cover" />
            <span className="min-w-0">
              <span className="block font-display text-lg leading-tight">Workspace</span>
              <span className="block truncate text-xs text-cream/75">
                {workspace.organizationName} · {roleLabel(workspace.role)}
              </span>
            </span>
          </Link>
          <div className="text-cream [&_span]:text-cream [&_button]:text-cream/80">
            <UserButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <nav
          className="flex gap-2 overflow-x-auto pb-1 lg:w-52 lg:flex-col lg:overflow-visible"
          aria-label="Organization"
        >
          {links.map((link) => {
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
