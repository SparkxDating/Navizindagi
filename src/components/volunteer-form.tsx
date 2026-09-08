import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { VOLUNTEER_AVAILABILITY, VOLUNTEER_INTERESTS, useLanguage, type MessageKey } from "@/lib/i18n";
import { submitVolunteer } from "@/lib/server/site";

export function VolunteerForm() {
  const submit = useServerFn(submitVolunteer);
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [website, setWebsite] = useState("");

  function toggleInterest(value: string) {
    setInterests((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (interests.length === 0) {
      toast.error(t("volunteer.interestError"));
      return;
    }
    if (form.get("consent") !== "on") {
      toast.error(t("volunteer.consentError"));
      return;
    }
    setBusy(true);
    try {
      await submit({
        data: {
          fullName: String(form.get("fullName") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          city: String(form.get("city") ?? ""),
          stateCountry: String(form.get("stateCountry") ?? ""),
          areasOfInterest: interests,
          availability: String(form.get("availability") ?? ""),
          skills: String(form.get("skills") ?? ""),
          message: String(form.get("message") ?? ""),
          consent: true,
          website,
        },
      });
      setDone(true);
      event.currentTarget.reset();
      setInterests([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("volunteer.sendError"));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-teal-soft p-8 text-center shadow-card">
        <h2 className="font-display text-2xl text-navy">{t("volunteer.thanks")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("volunteer.thanksBody")}</p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setDone(false)}>
          {t("volunteer.another")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-5 rounded-2xl bg-card p-6 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("volunteer.fullName")} htmlFor="fullName" required>
          <Input id="fullName" name="fullName" required minLength={2} maxLength={120} autoComplete="name" />
        </Field>
        <Field label={t("volunteer.email")} htmlFor="email" required>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label={t("volunteer.phone")} htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required minLength={8} maxLength={20} autoComplete="tel" />
        </Field>
        <Field label={t("volunteer.city")} htmlFor="city" required>
          <Input id="city" name="city" required minLength={2} maxLength={80} autoComplete="address-level2" />
        </Field>
        <Field label={t("volunteer.state")} htmlFor="stateCountry" required className="sm:col-span-2">
          <Input id="stateCountry" name="stateCountry" required minLength={2} maxLength={80} autoComplete="country-name" />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-navy">
          {t("volunteer.interests")} <span className="text-destructive">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {VOLUNTEER_INTERESTS.map((area) => (
            <label key={area.value} className="flex items-start gap-2 rounded-xl bg-cream px-3 py-2 text-sm">
              <Checkbox
                checked={interests.includes(area.value)}
                onChange={() => toggleInterest(area.value)}
              />
              {t(`volunteer.interest.${area.key}` as MessageKey)}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label={t("volunteer.availability")} htmlFor="availability" required>
        <Select id="availability" name="availability" required defaultValue="">
          <option value="" disabled>
            {t("volunteer.selectAvailability")}
          </option>
          {VOLUNTEER_AVAILABILITY.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`volunteer.avail.${option.key}` as MessageKey)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t("volunteer.skills")} htmlFor="skills" hint={t("volunteer.skillsHint")}>
        <Input id="skills" name="skills" maxLength={500} />
      </Field>
      <Field label={t("volunteer.message")} htmlFor="message">
        <Textarea id="message" name="message" maxLength={1000} placeholder={t("volunteer.messagePlaceholder")} />
      </Field>

      <label className="flex items-start gap-3 text-sm text-navy">
        <Checkbox name="consent" required />
        {t("volunteer.consent")}
      </label>

      <div className="hidden" aria-hidden>
        <Label htmlFor="vol-website">{t("volunteer.website")}</Label>
        <Input id="vol-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" disabled={busy} className="min-h-12 w-full sm:w-auto">
        {busy ? t("common.sending") : t("volunteer.submit")}
      </Button>
    </form>
  );
}
