import { createFileRoute } from "@tanstack/react-router";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { DataTable, Td } from "@/components/admin/data-table";
import { listDonations } from "@/lib/server/admin";
import { downloadTextFile, formatDate, formatINR, toCsv } from "@/lib/utils";

export const Route = createFileRoute("/admin/donations")({
  component: DonationsAdmin,
});

function DonationsAdmin() {
  const { data, error, loading } = useAdminQuery(() => listDonations());
  const donations = data ?? [];
  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Donations</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-navy">Donations</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            downloadTextFile(
              "donations.csv",
              toCsv(
                donations.map((item) => ({
                  reference: item.referenceId,
                  amount: item.amount,
                  status: item.status,
                  campaign: item.campaignTitle,
                  name: item.isAnonymous ? "Anonymous" : item.donorName,
                  email: item.email,
                  phone: item.phone,
                  createdAt: item.createdAt,
                })),
              ),
              "text/csv",
            )
          }
        >
          Export CSV
        </Button>
      </div>
      <DataTable
        headers={["Reference", "Amount", "Campaign", "Donor", "Status", "Date"]}
        empty="No donations yet."
      >
        {donations.map((item) => (
          <tr key={item.id}>
            <Td className="font-mono text-xs">{item.referenceId}</Td>
            <Td className="tabular-nums">{formatINR(item.amount)}</Td>
            <Td>{item.campaignTitle}</Td>
            <Td>
              {item.isAnonymous ? "Anonymous" : item.donorName}
              <span className="mt-1 block text-xs text-muted-foreground">{item.email}</span>
            </Td>
            <Td>{item.status}</Td>
            <Td>{formatDate(item.createdAt)}</Td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
