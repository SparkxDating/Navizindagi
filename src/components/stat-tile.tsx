import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl bg-card p-5 shadow-card", className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-dark">{label}</p>
      <p className="mt-2 font-display text-2xl tabular-nums text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
