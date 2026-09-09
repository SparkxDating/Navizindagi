import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteTeamMember, listTeamAdmin, saveTeamMember } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/team")({
  component: TeamAdmin,
});

function TeamAdmin() {
  const { data, error, loading, reload } = useAdminQuery(() => listTeamAdmin());
  const team = data ?? [];
  const [busy, setBusy] = useState(false);

  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">Leadership / team</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveTeamMember({
        data: {
          name: String(form.get("name") ?? ""),
          role: String(form.get("role") ?? ""),
          roleHi: String(form.get("roleHi") ?? ""),
          bio: String(form.get("bio") ?? ""),
          bioHi: String(form.get("bioHi") ?? ""),
          photoUrl: String(form.get("photoUrl") ?? ""),
          sortOrder: Number(form.get("sortOrder") ?? 0),
        },
      });
      toast.success("Team member saved");
      event.currentTarget.reset();
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-navy">Leadership / team</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" name="name" required />
          </Field>
          <Field label="Role" htmlFor="role" required>
            <Input id="role" name="role" required />
          </Field>
          <Field label="Role (हिंदी)" htmlFor="roleHi">
            <Input id="roleHi" name="roleHi" />
          </Field>
          <Field label="Photo URL" htmlFor="photoUrl" className="sm:col-span-2">
            <Input id="photoUrl" name="photoUrl" />
          </Field>
          <Field label="Bio" htmlFor="bio" className="sm:col-span-2">
            <Textarea id="bio" name="bio" />
          </Field>
          <Field label="Bio (हिंदी)" htmlFor="bioHi" className="sm:col-span-2">
            <Textarea id="bioHi" name="bioHi" />
          </Field>
          <Field label="Sort order" htmlFor="sortOrder">
            <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} />
          </Field>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add member"}
        </Button>
      </form>
      <ul className="space-y-3">
        {team.map((member) => (
          <li key={member.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div>
              <p className="font-semibold text-navy">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                void deleteTeamMember({ data: { id: member.id } })
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
