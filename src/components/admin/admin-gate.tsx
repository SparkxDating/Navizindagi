import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getAdminContext } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminGate({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  const [status, setStatus] = useState<"loading" | "ok" | "forbidden">("loading");

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      setStatus("loading");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    void getAdminContext()
      .then(() => {
        if (!cancelled) setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("forbidden");
      });
    return () => {
      cancelled = true;
    };
  }, [user, isPending]);

  if (isPending || (user && status === "loading")) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) return <RedirectToSignIn />;

  if (status === "forbidden") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-navy">Access is limited</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This account is signed in but is not authorised for the Navi Zindagi Foundation admin
          dashboard. Ask an existing administrator to grant access.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to the website</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
