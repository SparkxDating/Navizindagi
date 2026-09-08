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
import { AVAILABILITY_OPTIONS, INTEREST_AREAS } from "@/lib/site";
import { submitVolunteer } from "@/lib/server/site";

export function VolunteerForm() {
  const submit = useServerFn(submitVolunteer);
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
      toast.error("Select at least one area of interest.");
      return;
    }
    if (form.get("consent") !== "on") {
      toast.error("Consent is required.");
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
      toast.error(error instanceof Error ? error.message : "Could not send your registration.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-teal-soft p-8 text-center shadow-card">
        <h2 className="font-display text-2xl text-navy">Thank you for offering to help</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your volunteer registration has been received. We will review your information and contact
          you if there is a suitable opportunity. Submitting this form is not a guarantee of
          placement.
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-5 rounded-2xl bg-card p-6 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required>
          <Input id="fullName" name="fullName" required minLength={2} maxLength={120} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" type="tel" required minLength={8} maxLength={20} autoComplete="tel" />
        </Field>
        <Field label="City" htmlFor="city" required>
          <Input id="city" name="city" required minLength={2} maxLength={80} autoComplete="address-level2" />
        </Field>
        <Field label="State / country" htmlFor="stateCountry" required className="sm:col-span-2">
          <Input id="stateCountry" name="stateCountry" required minLength={2} maxLength={80} autoComplete="country-name" />
        </Field>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-navy">
          Areas of interest <span className="text-destructive">*</span>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {INTEREST_AREAS.map((area) => (
            <label key={area} className="flex items-start gap-2 rounded-xl bg-cream px-3 py-2 text-sm">
              <Checkbox
                checked={interests.includes(area)}
                onChange={() => toggleInterest(area)}
              />
              {area}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Availability" htmlFor="availability" required>
        <Select id="availability" name="availability" required defaultValue="">
          <option value="" disabled>
            Select availability
          </option>
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Skills" htmlFor="skills" hint="Optional — languages, first aid, logistics, design, and so on.">
        <Input id="skills" name="skills" maxLength={500} />
      </Field>
      <Field label="Message" htmlFor="message">
        <Textarea id="message" name="message" maxLength={1000} placeholder="Anything else the team should know" />
      </Field>

      <label className="flex items-start gap-3 text-sm text-navy">
        <Checkbox name="consent" required />
        I consent to Navi Zindagi Foundation storing this information to follow up about volunteer opportunities. I understand this is not a job offer or a guaranteed placement.
      </label>

      <div className="hidden" aria-hidden>
        <Label htmlFor="vol-website">Website</Label>
        <Input id="vol-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      <Button type="submit" disabled={busy} className="min-h-12 w-full sm:w-auto">
        {busy ? "Sending…" : "Submit volunteer registration"}
      </Button>
    </form>
  );
}
