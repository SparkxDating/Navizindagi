import { Link } from "@tanstack/react-router";
import type { CampaignUpdate } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Prose } from "./prose";

export function UpdateCard({ update }: { update: CampaignUpdate }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">
        {formatDate(update.publishedAt ?? update.createdAt)}
        {update.campaignTitle ? ` · ${update.campaignTitle}` : ""}
      </p>
      <h3 className="mt-2 font-display text-xl text-navy">{update.title}</h3>
      <Prose text={update.body} className="mt-3 text-sm" />
      {update.campaignSlug ? (
        <Link
          to="/campaign/$slug"
          params={{ slug: update.campaignSlug }}
          className="mt-4 inline-block text-sm font-semibold text-teal-dark"
        >
          View campaign
        </Link>
      ) : null}
    </article>
  );
}
