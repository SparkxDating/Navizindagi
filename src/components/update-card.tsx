import type { CampaignUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Prose } from "./prose";

export function UpdateCard({ update }: { update: CampaignUpdate }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">
        {formatDate(update.publishedAt ?? update.createdAt)}
      </p>
      <h3 className="mt-2 font-display text-xl text-navy">{update.title}</h3>
      <Prose text={update.body} className="mt-3 text-sm" />
    </article>
  );
}
