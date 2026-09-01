import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnquiry } from "@/lib/server/site";

export function ContactForm() {
  const submit = useServerFn(submitEnquiry);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [website, setWebsite] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await submit({
        data: {
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          phone: String(form.get("phone") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
          website,
        },
      });
      setDone(true);
      event.currentTarget.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your message.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-teal-soft p-8 text-center shadow-card">
        <h2 className="font-display text-2xl text-navy">Message received</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thank you. The Foundation will reply using the email you provided. For urgent matters,
          please use the published phone or WhatsApp number.
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 rounded-2xl bg-card p-6 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required>
          <Input id="name" name="name" required minLength={2} maxLength={120} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="email" required>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" maxLength={20} autoComplete="tel" />
        </Field>
        <Field label="Subject" htmlFor="subject" required>
          <Input id="subject" name="subject" required minLength={3} maxLength={160} />
        </Field>
      </div>
      <Field label="Message" htmlFor="message" required>
        <Textarea id="message" name="message" required minLength={10} maxLength={2000} />
      </Field>
      <div className="hidden" aria-hidden>
        <Label htmlFor="enq-website">Website</Label>
        <Input id="enq-website" value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
