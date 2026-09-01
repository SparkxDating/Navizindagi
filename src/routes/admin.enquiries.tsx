import { createFileRoute } from "@tanstack/react-router";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { DataTable, Td } from "@/components/admin/data-table";
import { listEnquiries } from "@/lib/server/admin";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/enquiries")({
  component: EnquiriesAdmin,
});

function EnquiriesAdmin() {
  const { data, error, loading } = useAdminQuery(() => listEnquiries());
  const rows = data ?? [];
  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Contact enquiries</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-navy">Contact enquiries</h1>
      <DataTable headers={["Name", "Contact", "Subject", "Message", "Date"]} empty="No enquiries yet.">
        {rows.map((item) => (
          <tr key={item.id}>
            <Td>{item.name}</Td>
            <Td>
              {item.email}
              {item.phone ? <span className="mt-1 block text-xs text-muted-foreground">{item.phone}</span> : null}
            </Td>
            <Td>{item.subject}</Td>
            <Td className="max-w-xs">{item.message}</Td>
            <Td>{formatDate(item.createdAt)}</Td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
