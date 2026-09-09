import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { campaignField, dateLocale, displayCampaignTitle, useLanguage, type MessageKey } from "@/lib/i18n";
import { PRESET_AMOUNTS } from "@/lib/site";
import {
  completeSandboxDonation,
  createDonation,
  verifyRazorpayPayment,
} from "@/lib/server/payment";
import type { Campaign, PaymentConfig } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById("razorpay-checkout");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const STEP_KEYS = ["campaign", "amount", "details", "payment"] as const;

export function DonationForm({
  campaigns,
  payment,
  initialSlug,
  orgName,
}: {
  campaigns: Campaign[];
  payment: PaymentConfig;
  initialSlug?: string;
  orgName: string;
}) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const locale = dateLocale(language);
  const create = useServerFn(createDonation);
  const verify = useServerFn(verifyRazorpayPayment);
  const completeSandbox = useServerFn(completeSandboxDonation);

  const defaultSlug =
    initialSlug && campaigns.some((campaign) => campaign.slug === initialSlug)
      ? initialSlug
      : (campaigns.find((campaign) => campaign.slug === "nepal-flood-relief")?.slug ??
        campaigns[0]?.slug ??
        "");

  const [step, setStep] = useState(1);
  const [campaignSlug, setCampaignSlug] = useState(defaultSlug);
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [sandboxStep, setSandboxStep] = useState<{
    referenceId: string;
    amount: number;
    campaignTitle: string;
  } | null>(null);

  const selected = campaigns.find((campaign) => campaign.slug === campaignSlug);
  const selectedTitle = selected
    ? displayCampaignTitle(language, selected.slug, selected.title)
    : t("donate.floodRelief");
  const resolvedAmount = usingCustom ? Number.parseInt(custom, 10) || 0 : amount;

  const amountError = useMemo(() => {
    if (resolvedAmount < 100) return t("donate.minAmount");
    if (resolvedAmount > 10_000_000) return t("donate.maxAmount");
    return "";
  }, [resolvedAmount, t]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (amountError) {
      toast.error(amountError);
      return;
    }
    setBusy(true);
    try {
      const result = await create({
        data: {
          campaignSlug,
          amount: resolvedAmount,
          donorName,
          email,
          phone,
          message,
          anonymous,
          website,
        },
      });
      if (result.status === "ignored") {
        toast.success(t("donate.thankYou"));
        return;
      }
      if (result.mode === "sandbox") {
        setSandboxStep({
          referenceId: result.referenceId,
          amount: result.amount,
          campaignTitle: result.campaignTitle,
        });
        return;
      }
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay || !result.orderId || !result.publicKey) {
        throw new Error(t("donate.checkoutLoad"));
      }
      const checkout = new window.Razorpay({
        key: result.publicKey,
        amount: result.amount * 100,
        currency: "INR",
        name: orgName,
        description: result.campaignTitle,
        order_id: result.orderId,
        prefill: { name: donorName, email, contact: phone },
        notes: { referenceId: result.referenceId, campaign: campaignSlug },
        theme: { color: "#1a8a80" },
        handler: async (response: {
          razorpay_payment_id?: string;
          razorpay_order_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            await verify({
              data: {
                referenceId: result.referenceId,
                razorpayPaymentId: response.razorpay_payment_id ?? "",
                razorpayOrderId: response.razorpay_order_id ?? "",
                razorpaySignature: response.razorpay_signature ?? "",
              },
            });
            await navigate({
              to: "/donate/thank-you",
              search: { ref: result.referenceId },
            });
          } catch (error) {
            toast.error(error instanceof Error ? error.message : t("donate.verifyFail"));
          }
        },
      });
      checkout.on("payment.failed", () => {
        toast.error(t("donate.failed"));
      });
      checkout.open();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("donate.startFail"));
    } finally {
      setBusy(false);
    }
  }

  async function confirmSandbox() {
    if (!sandboxStep) return;
    setBusy(true);
    try {
      await completeSandbox({ data: { referenceId: sandboxStep.referenceId } });
      await navigate({ to: "/donate/thank-you", search: { ref: sandboxStep.referenceId } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("donate.testFail"));
    } finally {
      setBusy(false);
    }
  }

  if (sandboxStep) {
    return (
      <div className="space-y-5 rounded-2xl bg-card p-6 shadow-card sm:p-8">
        <p className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-dark">
          {t("donate.sandboxBadge")}
        </p>
        <h2 className="font-display text-2xl text-navy">{t("donate.sandboxTitle")}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{t("donate.sandboxBody")}</p>
        <dl className="grid gap-3 rounded-xl bg-cream p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("donate.amountLabel")}</dt>
            <dd className="font-semibold tabular-nums text-navy">{formatINR(sandboxStep.amount, locale)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("donate.campaignLabel")}</dt>
            <dd className="text-right text-navy">
              {displayCampaignTitle(language, campaignSlug, sandboxStep.campaignTitle)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t("donate.reference")}</dt>
            <dd className="font-mono text-navy">{sandboxStep.referenceId}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={() => void confirmSandbox()} disabled={busy}>
            {busy ? t("donate.recording") : t("donate.confirmTest")}
          </Button>
          <Button type="button" variant="outline" onClick={() => setSandboxStep(null)} disabled={busy}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    );
  }

  function goNext() {
    if (step === 1 && !campaignSlug) {
      toast.error(t("donate.chooseCampaignError"));
      return;
    }
    if (step === 2 && amountError) {
      toast.error(amountError);
      return;
    }
    setStep((current) => Math.min(3, current + 1));
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-8">
      <ol className="grid grid-cols-2 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid-cols-4 sm:text-xs">
        {STEP_KEYS.map((key, index) => {
          const number = index + 1;
          const active = step === number || (step === 3 && number === 4);
          const done = step > number || (step === 3 && number < 4);
          return (
            <li
              key={key}
              className={cn(
                "rounded-full px-2 py-2",
                active || done ? "bg-teal-soft text-teal-dark" : "bg-muted",
              )}
            >
              {number}. {t(`donate.steps.${key}` as MessageKey)}
            </li>
          );
        })}
      </ol>

      {step === 1 ? (
        <fieldset className="space-y-3">
          <legend className="font-display text-2xl text-navy">{t("donate.chooseCampaign")}</legend>
          <div className="grid gap-3">
            {campaigns.map((campaign) => (
              <label
                key={campaign.slug}
                className={cn(
                  "flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border bg-cream/60 p-4 transition-colors",
                  campaignSlug === campaign.slug ? "border-teal bg-teal-soft" : "border-border hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="campaign"
                  value={campaign.slug}
                  checked={campaignSlug === campaign.slug}
                  onChange={() => setCampaignSlug(campaign.slug)}
                  className="mt-1 accent-teal"
                />
                <span>
                  <span className="block font-semibold text-navy">
                    {displayCampaignTitle(language, campaign.slug, campaign.title)}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {campaignField(language, campaign.slug, "shortDescription", campaign.shortDescription)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {step === 2 ? (
        <fieldset className="space-y-3">
          <legend className="font-display text-2xl text-navy">{t("donate.amount")}</legend>
          <p className="text-sm text-muted-foreground">{t("donate.supporting", { title: selectedTitle })}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setUsingCustom(false);
                  setAmount(preset);
                }}
                className={cn(
                  "min-h-14 rounded-2xl border px-3 text-base font-semibold tabular-nums transition-colors",
                  !usingCustom && amount === preset
                    ? "border-teal bg-teal text-primary-foreground shadow-card"
                    : "border-border bg-cream text-navy hover:bg-muted",
                )}
              >
                {formatINR(preset, locale)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setUsingCustom(true);
                document.getElementById("custom-amount")?.focus();
              }}
              className={cn(
                "min-h-14 rounded-2xl border px-3 text-sm font-semibold transition-colors sm:col-span-1",
                usingCustom
                  ? "border-teal bg-teal text-primary-foreground shadow-card"
                  : "border-border bg-cream text-navy hover:bg-muted",
              )}
            >
              {t("donate.customAmount")}
            </button>
          </div>
          <Field label={t("donate.customAmount")} htmlFor="custom-amount" error={usingCustom ? amountError : undefined}>
            <Input
              id="custom-amount"
              inputMode="numeric"
              value={custom}
              onChange={(event) => {
                setUsingCustom(true);
                setCustom(event.target.value.replace(/[^\d]/g, ""));
              }}
              placeholder={t("donate.customPlaceholder")}
            />
          </Field>
        </fieldset>
      ) : null}

      {step === 3 ? (
        <>
          <div className="rounded-2xl bg-cream p-4 text-sm">
            <p className="font-semibold text-navy">{selectedTitle}</p>
            <p className="mt-1 tabular-nums text-muted-foreground">{formatINR(resolvedAmount, locale)}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("donate.donorName")} htmlFor="donor-name" required>
              <Input
                id="donor-name"
                required
                minLength={2}
                maxLength={120}
                value={donorName}
                onChange={(event) => setDonorName(event.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field label={t("donate.email")} htmlFor="donor-email" required>
              <Input
                id="donor-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field label={t("donate.phone")} htmlFor="donor-phone" required className="sm:col-span-2">
              <Input
                id="donor-phone"
                type="tel"
                required
                minLength={8}
                maxLength={20}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </Field>
            <Field label={t("donate.message")} htmlFor="donor-message" className="sm:col-span-2">
              <Textarea
                id="donor-message"
                maxLength={1000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={t("donate.messagePlaceholder")}
              />
            </Field>
          </div>

          <label className="flex items-start gap-3 text-sm text-navy">
            <Checkbox checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            {t("donate.anonymous")}
          </label>

          <div className="hidden" aria-hidden>
            <Label htmlFor="website">{t("donate.website")}</Label>
            <Input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-cream p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy">
              <Lock className="size-4" />
              {t("donate.lock")}
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-teal" />
                {t("donate.gateway")}
              </li>
              <li className="flex items-start gap-2">
                <CreditCard className="mt-0.5 size-4 shrink-0 text-teal" />
                {t("donate.cards")}
              </li>
              <li className="flex items-start gap-2">
                <Smartphone className="mt-0.5 size-4 shrink-0 text-teal" />
                {t("donate.verified")}
              </li>
            </ul>
            {payment.mode === "sandbox" ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t("donate.sandboxNote")} {t("donate.sandboxTodo")}
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">{t("donate.razorpayNote")}</p>
            )}
          </div>
        </>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)}>
            {t("common.back")}
          </Button>
        ) : null}
        {step < 3 ? (
          <Button type="button" size="lg" onClick={goNext} className="min-h-12 sm:ml-auto">
            {t("common.continue")}
          </Button>
        ) : (
          <Button type="submit" size="lg" disabled={busy || !campaignSlug} className="min-h-12 sm:ml-auto">
            {busy ? t("common.pleaseWait") : t("donate.paySecurely", { amount: formatINR(resolvedAmount || 0, locale) })}
          </Button>
        )}
      </div>
    </form>
  );
}
