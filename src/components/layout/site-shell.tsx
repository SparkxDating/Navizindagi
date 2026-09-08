import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { HeartHandshake, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/types";
import { whatsappHref } from "@/lib/utils";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function SiteShell({
  children,
  settings,
}: {
  children: ReactNode;
  settings: SiteSettings | null;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const hideSticky =
    pathname.startsWith("/donate") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/campaign/") ||
    pathname === "/login";
  const whatsapp = settings?.whatsapp?.trim();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar orgName={settings?.orgName} tagline={settings?.tagline} />
      <main className="flex-1 pb-20 sm:pb-0">{children}</main>
      <Footer settings={settings} />

      {!hideSticky ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <Button asChild className="w-full min-h-12">
            <Link to="/donate" search={{ campaign: undefined }}>
              <HeartHandshake className="size-4" />
              Donate Now
            </Link>
          </Button>
        </div>
      ) : null}

      {whatsapp && !pathname.startsWith("/admin") ? (
        <a
          href={whatsappHref(whatsapp, "Hello, I would like to know more about Navi Zindagi Foundation flood relief.")}
          className="fixed bottom-20 right-4 z-30 inline-flex size-12 items-center justify-center rounded-full bg-teal text-primary-foreground shadow-card sm:bottom-6"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="size-5" />
        </a>
      ) : null}
    </div>
  );
}
