import { useLanguage } from "@/lib/i18n";
import { cn, progressPercent } from "@/lib/utils";

export function ProgressBar({
  raised,
  target,
  className,
}: {
  raised: number;
  target: number;
  className?: string;
}) {
  const { t } = useLanguage();
  const percent = progressPercent(raised, target);
  const unknown = !target;
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={unknown ? undefined : percent}
        aria-label={unknown ? t("progress.unknown") : t("progress.ofTarget", { percent })}
      >
        <div
          className="h-full rounded-full bg-teal transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: unknown ? "0%" : `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {unknown ? t("progress.targetUnknown") : t("progress.published", { percent })}
      </p>
    </div>
  );
}
