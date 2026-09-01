import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  className,
  tone = "paper",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  children: ReactNode;
  className?: string;
  tone?: "paper" | "cream" | "navy" | "white";
}) {
  const tones = {
    paper: "bg-paper text-foreground",
    cream: "bg-cream text-foreground",
    white: "bg-card text-foreground",
    navy: "bg-navy text-cream",
  } as const;
  return (
    <section id={id} className={cn("px-4 py-16 sm:px-6 sm:py-20 lg:py-24", tones[tone], className)}>
      <div className="mx-auto w-full max-w-6xl">
        {(eyebrow || title || lead) && (
          <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
            {eyebrow ? (
              <p
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-[0.18em]",
                  tone === "navy" ? "text-gold" : "text-teal-dark",
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2
                className={cn(
                  "font-display text-3xl sm:text-4xl",
                  tone === "navy" ? "text-cream" : "text-navy",
                )}
              >
                {title}
              </h2>
            ) : null}
            {lead ? (
              <p
                className={cn(
                  "mx-auto mt-4 max-w-2xl text-base leading-relaxed",
                  tone === "navy" ? "text-cream/80" : "text-muted-foreground",
                )}
              >
                {lead}
              </p>
            ) : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy px-4 py-16 sm:px-6 sm:py-20">
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy/85 to-navy-deep" />
      <div className="relative mx-auto max-w-3xl text-center">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-4xl text-cream sm:text-5xl">{title}</h1>
        {lead ? <p className="mt-4 text-base leading-relaxed text-cream/80 sm:text-lg">{lead}</p> : null}
      </div>
    </section>
  );
}
