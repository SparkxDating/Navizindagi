import type { ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteShell } from "@/components/layout/site-shell";
import { NotFoundPage } from "@/components/not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/lib/auth/provider";
import { AppErrorComponent } from "@/lib/error-component";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, APP_TITLE, SITE_URL } from "@/lib/site";
import { getSettings } from "@/lib/server/site";
import appCss from "@/styles.css?url";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: APP_NAME,
  slogan: APP_TAGLINE,
  description: APP_DESCRIPTION,
  url: "https://navizindagi.org",
  logo: "/logo.jpg",
};

export const Route = createRootRoute({
  loader: () => getSettings().catch(() => null),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_TITLE },
      { name: "description", content: APP_DESCRIPTION },
      { name: "theme-color", content: "#0B1F3A" },
      { property: "og:title", content: APP_TITLE },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:image", content: `${SITE_URL}/og.jpg` },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: APP_TITLE },
      { name: "twitter:description", content: APP_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/og.jpg` },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/logo.jpg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap",
      },
    ],
  }),
  component: RootComponent,
  errorComponent: AppErrorComponent,
  notFoundComponent: NotFoundPage,
  pendingComponent: PagePending,
});

function PagePending() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-16">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-56 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

function RootComponent() {
  const settings = Route.useLoaderData();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const bare = pathname.startsWith("/admin") || pathname === "/login";

  return (
    <RootDocument>
      <AuthProvider>
        <PreviewHostBridge />
        {bare ? <Outlet /> : <SiteShell settings={settings}><Outlet /></SiteShell>}
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
