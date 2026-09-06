import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminWorkspace } from "@/components/admin/admin-gate";
import { listAdminCampaigns, saveCampaign } from "@/lib/server/admin";
import type { Campaign } from "@/lib/types";

export const Route = createFileRoute("/admin/campaigns")({
  component: CampaignsAdmin,
});

function emptyCampaign(): Partial<Campaign> & { reliefPrioritiesText: string } {
  return {
    slug: "",
    title: "",
    locationLabel: "",
    countryCode: "",
    heroImageUrl: "",
    shortDescription: "",
    situationText: "",
    missionText: "",
    reliefPrioritiesText: "",
    utilisationNotes: "",
    targetAmount: 0,
    manualAmountRaised: 0,
    manualDonorCount: 0,
    isFeatured: false,
    isActive: true,
    sortOrder: 0,
  };
}

function CampaignsAdmin() {
  const workspace = useAdminWorkspace();
  const canWrite = workspace.permissions.writeCampaigns;
  const { data, error, loading, reload } = useAdminQuery(() => listAdminCampaigns());
  const campaigns = data ?? [];
  const [editing, setEditing] = useState<(Partial<Campaign> & { reliefPrioritiesText: string }) | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Campaigns</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }

  function startEdit(campaign?: Campaign) {
    if (!campaign) {
      setEditing(emptyCampaign());
      return;
    }
    setEditing({
      ...campaign,
      reliefPrioritiesText: campaign.reliefPriorities.join("\n"),
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveCampaign({
        data: {
          id: editing.id,
          slug: String(form.get("slug") ?? ""),
          title: String(form.get("title") ?? ""),
          locationLabel: String(form.get("locationLabel") ?? ""),
          countryCode: String(form.get("countryCode") ?? ""),
          heroImageUrl: String(form.get("heroImageUrl") ?? ""),
          shortDescription: String(form.get("shortDescription") ?? ""),
          situationText: String(form.get("situationText") ?? ""),
          missionText: String(form.get("missionText") ?? ""),
          reliefPriorities: String(form.get("reliefPriorities") ?? ""),
          utilisationNotes: String(form.get("utilisationNotes") ?? ""),
          targetAmount: Number(form.get("targetAmount") ?? 0),
          manualAmountRaised: Number(form.get("manualAmountRaised") ?? 0),
          manualDonorCount: Number(form.get("manualDonorCount") ?? 0),
          isFeatured: form.get("isFeatured") === "on",
          isActive: form.get("isActive") === "on",
          sortOrder: Number(form.get("sortOrder") ?? 0),
        },
      });
      toast.success("Campaign saved");
      setEditing(null);
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save campaign.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-navy">Campaigns</h1>
        {canWrite ? (
          <Button type="button" onClick={() => startEdit()}>
            New campaign
          </Button>
        ) : null}
      </div>
      <div className="space-y-3">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div>
              <p className="font-semibold text-navy">{campaign.title}</p>
              <p className="text-xs text-muted-foreground">
                /campaign/{campaign.slug} · {campaign.isActive ? "Active" : "Hidden"}
              </p>
            </div>
            {canWrite ? (
              <Button type="button" size="sm" variant="outline" onClick={() => startEdit(campaign)}>
                Edit
              </Button>
            ) : null}
          </article>
        ))}
      </div>
      {editing ? (
        <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
          <h2 className="font-display text-xl text-navy">{editing.id ? "Edit campaign" : "New campaign"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" required>
              <Input id="title" name="title" required defaultValue={editing.title} />
            </Field>
            <Field label="Slug" htmlFor="slug" required>
              <Input id="slug" name="slug" required defaultValue={editing.slug} />
            </Field>
            <Field label="Location label" htmlFor="locationLabel" required>
              <Input id="locationLabel" name="locationLabel" required defaultValue={editing.locationLabel} />
            </Field>
            <Field label="Country code" htmlFor="countryCode">
              <Input id="countryCode" name="countryCode" defaultValue={editing.countryCode} />
            </Field>
            <Field label="Hero image URL" htmlFor="heroImageUrl" className="sm:col-span-2">
              <Input id="heroImageUrl" name="heroImageUrl" defaultValue={editing.heroImageUrl} />
            </Field>
            <Field label="Short description" htmlFor="shortDescription" className="sm:col-span-2" required>
              <Textarea id="shortDescription" name="shortDescription" required defaultValue={editing.shortDescription} />
            </Field>
            <Field label="Situation" htmlFor="situationText" className="sm:col-span-2" required>
              <Textarea id="situationText" name="situationText" required defaultValue={editing.situationText} />
            </Field>
            <Field label="Mission" htmlFor="missionText" className="sm:col-span-2" required>
              <Textarea id="missionText" name="missionText" required defaultValue={editing.missionText} />
            </Field>
            <Field label="Relief priorities (one per line)" htmlFor="reliefPriorities" className="sm:col-span-2">
              <Textarea id="reliefPriorities" name="reliefPriorities" defaultValue={editing.reliefPrioritiesText} />
            </Field>
            <Field label="Utilisation notes" htmlFor="utilisationNotes" className="sm:col-span-2">
              <Textarea id="utilisationNotes" name="utilisationNotes" defaultValue={editing.utilisationNotes} />
            </Field>
            <Field label="Target amount (INR)" htmlFor="targetAmount">
              <Input id="targetAmount" name="targetAmount" type="number" min={0} defaultValue={editing.targetAmount} />
            </Field>
            <Field label="Manual amount raised" htmlFor="manualAmountRaised" hint="Kept for records. Public totals use verified completed payments only.">
              <Input id="manualAmountRaised" name="manualAmountRaised" type="number" min={0} defaultValue={editing.manualAmountRaised} />
            </Field>
            <Field label="Manual donor count" htmlFor="manualDonorCount">
              <Input id="manualDonorCount" name="manualDonorCount" type="number" min={0} defaultValue={editing.manualDonorCount} />
            </Field>
            <Field label="Sort order" htmlFor="sortOrder">
              <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={editing.sortOrder} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isFeatured" defaultChecked={editing.isFeatured} /> Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="isActive" defaultChecked={editing.isActive} /> Active
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
