import type { ReactNode } from "react";
import { PageHero } from "./section";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <PageHero title={title} lead={`Last updated: ${updated}`} />
      <article className="mx-auto max-w-3xl space-y-6 px-4 py-12 text-sm leading-relaxed text-muted-foreground sm:px-6">
        {children}
      </article>
    </>
  );
}
