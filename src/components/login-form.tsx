import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient, GROK_PROVIDERS, signIn } from "@/lib/auth/client";

export function LoginForm() {
  const navigate = useNavigate();
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
        if (error) throw new Error(error.message ?? "Could not create the account.");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/admin",
        });
        if (error) throw new Error(error.message ?? "Could not sign in.");
      }
      await navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-4">
        {mode === "signup" ? (
          <Field label="Name" htmlFor="admin-name" required>
            <Input
              id="admin-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
            />
          </Field>
        ) : null}
        <Field label="Email" htmlFor="admin-email" required>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </Field>
        <Field label="Password" htmlFor="admin-password" required>
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
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>

      <button
        type="button"
        className="w-full text-center text-sm text-teal-dark underline-offset-4 hover:underline"
        onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <p className="relative mx-auto w-fit bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
          Or continue with
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
                toast.error(error instanceof Error ? error.message : "Sign-in failed.");
              });
            }}
          >
            Continue with {provider.label}
          </Button>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Admin access is limited to authorised Foundation accounts. The first signed-in user on a
        new installation is recorded as an administrator; later accounts need to be granted access.
      </p>
    </div>
  );
}
