import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t("lang.switcher")}
      className={cn("inline-flex items-center gap-1 text-sm", className)}
    >
      <button
        type="button"
        aria-pressed={language === "en"}
        aria-current={language === "en" ? "true" : undefined}
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          language === "en"
            ? "font-semibold text-navy underline decoration-2 underline-offset-4"
            : "text-navy/70 hover:text-navy",
        )}
      >
        {t("lang.name")}
      </button>
      <span className="text-navy/35" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        aria-pressed={language === "hi"}
        aria-current={language === "hi" ? "true" : undefined}
        onClick={() => setLanguage("hi")}
        className={cn(
          "rounded-full px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          language === "hi"
            ? "font-semibold text-navy underline decoration-2 underline-offset-4"
            : "text-navy/70 hover:text-navy",
        )}
      >
        {t("lang.hindi")}
      </button>
    </div>
  );
}
