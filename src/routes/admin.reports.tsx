import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteReport, listReportsAdmin, saveReport } from "@/lib/server/admin";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsAdmin,
});

function ReportsAdmin() {
  const { data, error, loading, reload } = useAdminQuery(() => listReportsAdmin());
  const reports = data ?? [];
  const [busy, setBusy] = useState(false);

  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Reports and documents</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveReport({
        data: {
          title: String(form.get("title") ?? ""),
          description: String(form.get("description") ?? ""),
          url: String(form.get("url") ?? ""),
          published: form.get("published") === "on",
        },
      });
      toast.success("Report saved");
      event.currentTarget.reset();
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-navy">Reports and documents</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
        <Field label="Title" htmlFor="title" required>
          <Input id="title" name="title" required />
        </Field>
        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" />
        </Field>
        <Field label="Document URL" htmlFor="url" hint="Link to a PDF or published file. File uploads can be added later.">
          <Input id="url" name="url" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="published" defaultChecked /> Publish
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save report"}
        </Button>
      </form>
      <ul className="space-y-3">
        {reports.map((report) => (
          <li key={report.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div>
              <p className="font-semibold text-navy">{report.title}</p>
              <p className="text-sm text-muted-foreground">{report.description || "No description"}</p>
              <p className="text-xs text-muted-foreground">{formatDate(report.publishedAt)}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                void deleteReport({ data: { id: report.id } })
                  .then(() => reload())
                  .catch((error: unknown) =>
                    toast.error(error instanceof Error ? error.message : "Could not delete."),
                  );
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
