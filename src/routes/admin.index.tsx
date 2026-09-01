import { Link, createFileRoute } from "@tanstack/react-router";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { StatTile } from "@/components/stat-tile";
import { Button } from "@/components/ui/button";
import { getDashboard } from "@/lib/server/admin";
import { formatDate, formatINR } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data, error, loading } = useAdminQuery(() => getDashboard());
  if (loading || error || !data) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Overview</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }
  const { stats, recentDonations, recentVolunteers, recentEnquiries } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Completed totals exclude pending and sandbox payments.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Verified donations" value={formatINR(stats.donationTotal)} hint={`${stats.completedDonationCount} completed`} />
        <StatTile label="Sandbox records" value={String(stats.sandboxDonationCount)} hint="Not live funds" />
        <StatTile label="Volunteers" value={String(stats.volunteerCount)} />
        <StatTile label="Enquiries" value={String(stats.enquiryCount)} />
      </div>
      <section>
        <h2 className="font-display text-xl text-navy">Campaigns</h2>
        <div className="mt-3 grid gap-3">
          {stats.campaigns.map((campaign) => (
            <div key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
              <div>
                <p className="font-semibold text-navy">{campaign.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatINR(campaign.amountRaised)}
                  {campaign.targetAmount > 0 ? ` of ${formatINR(campaign.targetAmount)}` : " · target to be updated"}
                  {` · ${campaign.donorCount} donors`}
                </p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/campaigns">Edit</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <Recent
          title="Recent donations"
          href="/admin/donations"
          rows={recentDonations.map((item) => [
            item.isAnonymous ? "Anonymous" : item.donorName,
            `${formatINR(item.amount)} · ${item.status}`,
            formatDate(item.createdAt),
          ])}
        />
        <Recent
          title="Volunteers"
          href="/admin/volunteers"
          rows={recentVolunteers.map((item) => [item.fullName, item.city, formatDate(item.createdAt)])}
        />
        <Recent
          title="Enquiries"
          href="/admin/enquiries"
          rows={recentEnquiries.map((item) => [item.name, item.subject, formatDate(item.createdAt)])}
        />
      </div>
    </div>
  );
}

function Recent({
  title,
  href,
  rows,
}: {
  title: string;
  href: "/admin/donations" | "/admin/volunteers" | "/admin/enquiries";
  rows: string[][];
}) {
  return (
    <section className="rounded-2xl bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg text-navy">{title}</h2>
        <Link to={href} className="text-xs font-semibold text-teal-dark">
          View all
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">None yet.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {rows.map((row) => (
            <li key={row.join("-")}>
              <p className="font-medium text-navy">{row[0]}</p>
              <p className="text-xs text-muted-foreground">
                {row[1]} · {row[2]}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
