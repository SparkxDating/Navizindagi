import { Link, createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Admin sign in · Navi Zindagi Foundation" }],
  }),
});

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="px-4 py-5">
        <Link to="/" className="mx-auto flex max-w-md items-center gap-2">
          <img src="/logo.jpg" alt="" className="size-10 rounded-full object-cover" />
          <span className="font-display text-lg text-navy">Navi Zindagi Foundation</span>
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        <div className="rounded-2xl bg-card p-6 shadow-card sm:p-8">
          <h1 className="font-display text-3xl text-navy">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is for Foundation administrators only.
          </p>
          <div className="mt-6">
            {isPending ? (
              <Skeleton className="h-40 w-full" />
            ) : user ? (
              <>
                <p className="text-sm text-muted-foreground">You are already signed in.</p>
                <Button asChild className="mt-4 w-full">
                  <Link to="/admin">Go to dashboard</Link>
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
