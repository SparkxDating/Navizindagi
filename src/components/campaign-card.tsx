import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import type { Campaign } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

export function CampaignCard({
  campaign,
  className,
}: {
  campaign: Campaign;
  className?: string;
}) {
  const hasFigures = campaign.targetAmount > 0 || campaign.amountRaised > 0;
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy">
        {campaign.heroImageUrl ? (
          <img
            src={campaign.heroImageUrl}
            alt={`${campaign.title} in ${campaign.locationLabel}`}
            className="size-full object-cover transition-transform duration-500 ease-out hover:scale-[1.03]"
            loading="lazy"
          />
        ) : null}
        <div className="absolute inset-x-0 bottom-0 bg-navy/70 p-4">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-semibold text-navy">
            <MapPin className="size-3.5" aria-hidden />
            {campaign.locationLabel}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h3 className="font-display text-2xl text-navy">{campaign.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{campaign.shortDescription}</p>
        </div>
        <div className="mt-auto space-y-3">
          {hasFigures ? (
            <>
              <div className="flex items-end justify-between gap-3 text-sm">
                <p>
                  <span className="block text-xs uppercase tracking-wide text-muted-foreground">Raised</span>
                  <span className="font-semibold tabular-nums text-navy">{formatINR(campaign.amountRaised)}</span>
                </p>
                <p className="text-right">
                  <span className="block text-xs uppercase tracking-wide text-muted-foreground">Target</span>
                  <span className="font-semibold tabular-nums text-navy">
                    {campaign.targetAmount > 0 ? formatINR(campaign.targetAmount) : "To be updated"}
                  </span>
                </p>
              </div>
              <ProgressBar raised={campaign.amountRaised} target={campaign.targetAmount} />
              <p className="text-xs text-muted-foreground">
                {campaign.donorCount > 0
                  ? `${campaign.donorCount} verified donation${campaign.donorCount === 1 ? "" : "s"}`
                  : "Donor count: Updates coming soon"}
              </p>
            </>
          ) : (
            <p className="rounded-xl bg-cream px-3 py-2 text-sm text-muted-foreground">
              Fundraising figures: Updates coming soon
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link to="/donate" search={{ campaign: campaign.slug }}>
                Support this campaign
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/campaign/$slug" params={{ slug: campaign.slug }}>
                View campaign
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
