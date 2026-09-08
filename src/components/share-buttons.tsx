import { useState } from "react";
import { Facebook, Link2, Share2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ShareButtons({
  title,
  path,
  className,
}: {
  title: string;
  path: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? path : new URL(path, window.location.origin).toString();
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url, text: title });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    await copyLink();
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <p className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("common.share")}</p>
      <button
        type="button"
        onClick={() => void nativeShare()}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-navy hover:bg-muted"
      >
        <Share2 className="size-3.5" aria-hidden />
        {t("common.share")}
      </button>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-10 items-center rounded-full border border-border bg-card px-3 text-sm font-medium text-navy hover:bg-muted"
      >
        {t("common.whatsapp")}
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-navy hover:bg-muted"
      >
        <Facebook className="size-3.5" aria-hidden />
        {t("common.facebook")}
      </a>
      <button
        type="button"
        onClick={() => void copyLink()}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-medium text-navy hover:bg-muted"
      >
        <Link2 className="size-3.5" aria-hidden />
        {copied ? t("common.copied") : t("common.copyLink")}
      </button>
    </div>
  );
}
