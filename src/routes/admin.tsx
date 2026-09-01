import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminShell } from "@/components/admin/admin-shell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin · Navi Zindagi Foundation" }] }),
});

function AdminLayout() {
  return (
    <AdminGate>
      <AdminShell>
        <Outlet />
      </AdminShell>
    </AdminGate>
  );
}
