import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ImpactCard({
  title,
  body,
  image,
  icon,
  className,
}: {
  title: string;
  body: string;
  image?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("overflow-hidden rounded-2xl bg-card shadow-card", className)}>
      {image ? (
        <div className="aspect-[16/10] overflow-hidden bg-navy">
          <img src={image} alt={title} className="size-full object-cover" loading="lazy" />
        </div>
      ) : null}
      <div className="space-y-2 p-6">
        {icon ? <div className="text-teal">{icon}</div> : null}
        <h3 className="font-display text-xl text-navy">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}
