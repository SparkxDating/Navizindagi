import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-dark">404</p>
      <h1 className="mt-3 font-display text-4xl text-navy">Page not found</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        That address is not part of the Navi Zindagi Foundation website. Check the link, or return
        to the homepage to donate or volunteer.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/donate" search={{ campaign: undefined }}>
            Donate
          </Link>
        </Button>
      </div>
    </div>
  );
}
