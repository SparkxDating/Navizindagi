import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSettings, saveSettings } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  const { data: settings, error, loading, reload } = useAdminQuery(() => getAdminSettings());
  const [busy, setBusy] = useState(false);

  if (loading || error || !settings) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">NGO settings</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? "");
    setBusy(true);
    try {
      await saveSettings({
        data: {
          orgName: read("orgName"),
          tagline: read("tagline"),
          taglineHi: read("taglineHi"),
          aboutText: read("aboutText"),
          aboutTextHi: read("aboutTextHi"),
          mission: read("mission"),
          missionHi: read("missionHi"),
          vision: read("vision"),
          visionHi: read("visionHi"),
          valuesText: read("valuesText"),
          valuesTextHi: read("valuesTextHi"),
          areasOfWork: read("areasOfWork"),
          areasOfWorkHi: read("areasOfWorkHi"),
          address: read("address"),
          phone: read("phone"),
          email: read("email"),
          whatsapp: read("whatsapp"),
          facebookUrl: read("facebookUrl"),
          instagramUrl: read("instagramUrl"),
          twitterUrl: read("twitterUrl"),
          mapsEmbedUrl: read("mapsEmbedUrl"),
          registrationCin: read("registrationCin"),
          registrationNotes: read("registrationNotes"),
          registrationNotesHi: read("registrationNotesHi"),
          howDonationsUsed: read("howDonationsUsed"),
          howDonationsUsedHi: read("howDonationsUsedHi"),
          paymentInfo: read("paymentInfo"),
          paymentInfoHi: read("paymentInfoHi"),
        },
      });
      toast.success("Settings saved");
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
      <h1 className="font-display text-3xl text-navy">NGO settings</h1>
      <div className="grid gap-4 rounded-2xl bg-card p-6 shadow-card sm:grid-cols-2">
        <Field label="Organisation name" htmlFor="orgName" required>
          <Input id="orgName" name="orgName" required defaultValue={settings.orgName} />
        </Field>
        <Field label="Tagline" htmlFor="tagline" required>
          <Input id="tagline" name="tagline" required defaultValue={settings.tagline} />
        </Field>
        <Field label="Tagline (हिंदी)" htmlFor="taglineHi">
          <Input id="taglineHi" name="taglineHi" defaultValue={settings.taglineHi} />
        </Field>
        <Field label="About" htmlFor="aboutText" className="sm:col-span-2">
          <Textarea id="aboutText" name="aboutText" defaultValue={settings.aboutText} />
        </Field>
        <Field label="About (हिंदी)" htmlFor="aboutTextHi" className="sm:col-span-2">
          <Textarea id="aboutTextHi" name="aboutTextHi" defaultValue={settings.aboutTextHi} />
        </Field>
        <Field label="Mission" htmlFor="mission" className="sm:col-span-2">
          <Textarea id="mission" name="mission" defaultValue={settings.mission} />
        </Field>
        <Field label="Mission (हिंदी)" htmlFor="missionHi" className="sm:col-span-2">
          <Textarea id="missionHi" name="missionHi" defaultValue={settings.missionHi} />
        </Field>
        <Field label="Vision" htmlFor="vision" className="sm:col-span-2">
          <Textarea id="vision" name="vision" defaultValue={settings.vision} />
        </Field>
        <Field label="Vision (हिंदी)" htmlFor="visionHi" className="sm:col-span-2">
          <Textarea id="visionHi" name="visionHi" defaultValue={settings.visionHi} />
        </Field>
        <Field label="Values" htmlFor="valuesText" className="sm:col-span-2">
          <Textarea id="valuesText" name="valuesText" defaultValue={settings.valuesText} />
        </Field>
        <Field label="Values (हिंदी)" htmlFor="valuesTextHi" className="sm:col-span-2">
          <Textarea id="valuesTextHi" name="valuesTextHi" defaultValue={settings.valuesTextHi} />
        </Field>
        <Field label="Areas of work" htmlFor="areasOfWork" className="sm:col-span-2">
          <Textarea id="areasOfWork" name="areasOfWork" defaultValue={settings.areasOfWork} />
        </Field>
        <Field label="Areas of work (हिंदी)" htmlFor="areasOfWorkHi" className="sm:col-span-2">
          <Textarea id="areasOfWorkHi" name="areasOfWorkHi" defaultValue={settings.areasOfWorkHi} />
        </Field>
        <Field label="Address" htmlFor="address" className="sm:col-span-2">
          <Input id="address" name="address" defaultValue={settings.address} />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={settings.phone} />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required defaultValue={settings.email} />
        </Field>
        <Field label="WhatsApp" htmlFor="whatsapp">
          <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} />
        </Field>
        <Field label="Facebook URL" htmlFor="facebookUrl">
          <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl} />
        </Field>
        <Field label="Instagram URL" htmlFor="instagramUrl">
          <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl} />
        </Field>
        <Field label="X URL" htmlFor="twitterUrl">
          <Input id="twitterUrl" name="twitterUrl" defaultValue={settings.twitterUrl} />
        </Field>
        <Field label="Maps embed URL" htmlFor="mapsEmbedUrl" className="sm:col-span-2">
          <Input id="mapsEmbedUrl" name="mapsEmbedUrl" defaultValue={settings.mapsEmbedUrl} />
        </Field>
        <Field label="CIN" htmlFor="registrationCin">
          <Input id="registrationCin" name="registrationCin" defaultValue={settings.registrationCin} />
        </Field>
        <Field label="Registration notes" htmlFor="registrationNotes" className="sm:col-span-2">
          <Textarea id="registrationNotes" name="registrationNotes" defaultValue={settings.registrationNotes} />
        </Field>
        <Field label="Registration notes (हिंदी)" htmlFor="registrationNotesHi" className="sm:col-span-2">
          <Textarea id="registrationNotesHi" name="registrationNotesHi" defaultValue={settings.registrationNotesHi} />
        </Field>
        <Field label="How donations are used" htmlFor="howDonationsUsed" className="sm:col-span-2">
          <Textarea id="howDonationsUsed" name="howDonationsUsed" defaultValue={settings.howDonationsUsed} />
        </Field>
        <Field label="How donations are used (हिंदी)" htmlFor="howDonationsUsedHi" className="sm:col-span-2">
          <Textarea id="howDonationsUsedHi" name="howDonationsUsedHi" defaultValue={settings.howDonationsUsedHi} />
        </Field>
        <Field label="Payment information" htmlFor="paymentInfo" className="sm:col-span-2">
          <Textarea id="paymentInfo" name="paymentInfo" defaultValue={settings.paymentInfo} />
        </Field>
        <Field label="Payment information (हिंदी)" htmlFor="paymentInfoHi" className="sm:col-span-2">
          <Textarea id="paymentInfoHi" name="paymentInfoHi" defaultValue={settings.paymentInfoHi} />
        </Field>
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
