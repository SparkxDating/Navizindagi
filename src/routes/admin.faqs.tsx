import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminStatus, useAdminQuery } from "@/components/admin/use-admin-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteFaq, listFaqsAdmin, saveFaq } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/faqs")({
  component: FaqsAdmin,
});

function FaqsAdmin() {
  const { data, error, loading, reload } = useAdminQuery(() => listFaqsAdmin());
  const faqs = data ?? [];
  const [busy, setBusy] = useState(false);

  if (loading || error) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl text-navy">FAQs</h1>
        <AdminStatus loading={loading} error={error} />
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await saveFaq({
        data: {
          question: String(form.get("question") ?? ""),
          questionHi: String(form.get("questionHi") ?? ""),
          answer: String(form.get("answer") ?? ""),
          answerHi: String(form.get("answerHi") ?? ""),
          sortOrder: Number(form.get("sortOrder") ?? 0),
          isPublished: form.get("isPublished") === "on",
        },
      });
      toast.success("FAQ saved");
      event.currentTarget.reset();
      reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save FAQ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-navy">FAQs</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4 rounded-2xl bg-card p-6 shadow-card">
        <Field label="Question" htmlFor="question" required>
          <Input id="question" name="question" required />
        </Field>
        <Field label="Question (हिंदी)" htmlFor="questionHi">
          <Input id="questionHi" name="questionHi" />
        </Field>
        <Field label="Answer" htmlFor="answer" required>
          <Textarea id="answer" name="answer" required />
        </Field>
        <Field label="Answer (हिंदी)" htmlFor="answerHi">
          <Textarea id="answerHi" name="answerHi" />
        </Field>
        <Field label="Sort order" htmlFor="sortOrder">
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={faqs.length + 1} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox name="isPublished" defaultChecked /> Published
        </label>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save FAQ"}
        </Button>
      </form>
      <ul className="space-y-3">
        {faqs.map((faq) => (
          <li key={faq.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card p-4 shadow-card">
            <div>
              <p className="font-semibold text-navy">{faq.question}</p>
              <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                void deleteFaq({ data: { id: faq.id } })
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
