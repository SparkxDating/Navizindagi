import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteUpdate, listUpdatesAdmin, saveUpdate } from "@/lib/server/admin";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/updates")({
  component: UpdatesAdmin,
});

function UpdatesAdmin() {
  const { data, error, loading, reload } = useAdminQuery(() => listUpdatesAdmin());
  const updates = data?.updates ?? [];
  const campaigns = data?.campaigns ?? [];
  const [busy, setBusy] = useState(false);

  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Campaign updates</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveUpdate({
        data: {
          campaignId: Number(form.get("campaignId")),
          title: String(form.get("title") ?? ""),
          titleHi: String(form.get("titleHi") ?? ""),
          body: String(form.get("body") ?? ""),
          bodyHi: String(form.get("bodyHi") ?? ""),
          published: form.get("published") === "on",
        },
      });
      toast.success("Update published");
      event.currentTarget.reset();
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save update.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-navy">Campaign updates</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
        <Field label="Campaign" htmlFor="campaignId" required>
          <Select id="campaignId" name="campaignId" required defaultValue="">
            <option value="" disabled>
              Select campaign
            </option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Title" htmlFor="title" required>
          <Input id="title" name="title" required />
        </Field>
        <Field label="Title (हिंदी)" htmlFor="titleHi">
          <Input id="titleHi" name="titleHi" />
        </Field>
        <Field label="Body" htmlFor="body" required>
          <Textarea id="body" name="body" required />
        </Field>
        <Field label="Body (हिंदी)" htmlFor="bodyHi">
          <Textarea id="bodyHi" name="bodyHi" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="published" defaultChecked /> Publish now
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save update"}
        </Button>
      </form>
      <ul className="space-y-3">
        {updates.map((update) => (
          <li key={update.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{update.title}</p>
                <p className="text-xs text-muted-foreground">
                  {update.publishedAt ? `Published ${formatDate(update.publishedAt)}` : "Draft"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{update.body}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => {
                  void deleteUpdate({ data: { id: update.id } })
                    .then(() => reload())
                    .catch((error: unknown) =>
                      toast.error(error instanceof Error ? error.message : "Could not delete."),
                    );
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
