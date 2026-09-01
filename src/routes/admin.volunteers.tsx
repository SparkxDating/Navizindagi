import { createFileRoute } from "@tanstack/react-router";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { DataTable, Td } from "@/components/admin/data-table";
import { listVolunteers } from "@/lib/server/admin";
import { downloadTextFile, formatDate, toCsv } from "@/lib/utils";

export const Route = createFileRoute("/admin/volunteers")({
  component: VolunteersAdmin,
});

function VolunteersAdmin() {
  const { data, error, loading } = useAdminQuery(() => listVolunteers());
  const rows = data ?? [];
  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Volunteers</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-navy">Volunteers</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            downloadTextFile(
              "volunteers.csv",
              toCsv(
                rows.map((item) => ({
                  name: item.fullName,
                  email: item.email,
                  phone: item.phone,
                  city: item.city,
                  stateCountry: item.stateCountry,
                  interests: item.areasOfInterest.join("; "),
                  availability: item.availability,
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
      <DataTable headers={["Name", "Contact", "Location", "Interest", "Date"]} empty="No volunteer submissions yet.">
        {rows.map((item) => (
          <tr key={item.id}>
            <Td>{item.fullName}</Td>
            <Td>
              {item.email}
              <span className="mt-1 block text-xs text-muted-foreground">{item.phone}</span>
            </Td>
            <Td>
              {item.city}, {item.stateCountry}
            </Td>
            <Td>
              {item.areasOfInterest.join(", ")}
              <span className="mt-1 block text-xs text-muted-foreground">{item.availability}</span>
            </Td>
            <Td>{formatDate(item.createdAt)}</Td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
