import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function ImpactCard({
  title,
  body,
  image,
  icon,
  href,
  hrefLabel = "Learn More",
  className,
}: {
  title: string;
  body: string;
  image?: string;
  icon?: ReactNode;
  href?: "/about" | "/campaigns" | "/donate" | "/volunteer";
  hrefLabel?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-shadow duration-200 motion-safe:hover:shadow-card-hover",
        className,
      )}
    >
      {image ? (
        <div className="aspect-[16/10] overflow-hidden bg-navy">
          <img src={image} alt="" className="size-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="grid aspect-[16/10] place-items-center bg-teal-soft text-teal">{icon}</div>
      )}
      <div className="flex flex-1 flex-col space-y-2 p-6">
        {image && icon ? <div className="text-teal">{icon}</div> : null}
        <h3 className="font-display text-xl text-navy">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        {href ? (
          <Link to={href} className="mt-auto pt-3 text-sm font-semibold text-teal-dark">
            {hrefLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
