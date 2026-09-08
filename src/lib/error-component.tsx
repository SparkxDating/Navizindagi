import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { EnsureLanguage, translate, useOptionalLanguage } from "@/lib/i18n";
import { DEFAULT_LANGUAGE } from "@/lib/i18n/types";

export function AppErrorComponent(props: ErrorComponentProps) {
  return (
    <EnsureLanguage>
      <ErrorBody {...props} />
    </EnsureLanguage>
  );
}

function ErrorBody({ error }: Pick<ErrorComponentProps, "error">) {
  const i18n = useOptionalLanguage();
  const language = i18n?.language ?? DEFAULT_LANGUAGE;
  const title = i18n?.t("error.title") ?? translate(language, "error.title");
  const fallback = i18n?.t("error.body") ?? translate(language, "error.body");
  const home = i18n?.t("common.backHome") ?? translate(language, "common.backHome");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6 text-center text-navy">
      <span className="text-destructive" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="max-w-md text-sm break-words text-muted-foreground">{error.message || fallback}</p>
      <Link to="/" className="mt-2 text-sm font-semibold text-teal-dark underline">
        {home}
      </Link>
    </main>
  );
}
