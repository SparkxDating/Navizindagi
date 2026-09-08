import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CtaBand({
  eyebrow,
  title,
  lead,
  actions,
  tone = "navy",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  actions: ReactNode;
  tone?: "navy" | "green";
}) {
  return (
    <section
      className={cn(
        "px-4 py-16 sm:px-6 sm:py-20",
        tone === "navy" ? "bg-navy text-cream" : "bg-teal text-primary-foreground",
      )}
    >
      <div className="mx-auto max-w-3xl text-center">
        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.18em]",
              tone === "navy" ? "text-teal-soft" : "text-white/80",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h2>
        {lead ? (
          <p className={cn("mt-4 text-base leading-relaxed", tone === "navy" ? "text-cream/80" : "text-white/90")}>
            {lead}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">{actions}</div>
      </div>
    </section>
  );
}
