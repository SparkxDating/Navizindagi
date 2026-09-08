import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";

export function LoginForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/admin",
        });
        if (error) throw new Error(error.message ?? t("login.createFail"));
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/admin",
        });
        if (error) throw new Error(error.message ?? t("login.signInFail"));
      }
      await navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("login.failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
        {mode === "signup" ? (
          <Field label={t("login.name")} htmlFor="admin-name" required>
            <Input
              id="admin-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
            />
          </Field>
        ) : null}
        <Field label={t("login.email")} htmlFor="admin-email" required>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </Field>
        <Field label={t("login.password")} htmlFor="admin-password" required>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? t("common.pleaseWait") : mode === "signup" ? t("login.create") : t("login.signIn")}
        </Button>
      </form>

      <button
        type="button"
        className="w-full text-center text-sm text-teal-dark underline-offset-4 hover:underline"
        onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? t("login.needAccount") : t("login.haveAccount")}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
          {t("login.orContinue")}
        </p>
      </div>

      <div className="grid gap-2">
        {GROK_PROVIDERS.map((provider) => (
          <Button
            key={provider.providerId}
            type="button"
            variant="outline"
            className="w-full"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void signIn(provider.providerId, {
                callbackURL: "/admin",
                errorCallbackURL: "/login",
              }).catch((error: unknown) => {
                setBusy(false);
                toast.error(error instanceof Error ? error.message : t("login.failed"));
              });
            }}
          >
            {t("login.continueWith", { provider: provider.label })}
          </Button>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{t("login.adminNote")}</p>
    </div>
  );
}
