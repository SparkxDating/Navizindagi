import { Building2, MapPin, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function TrustBar({ settings }: { settings: SiteSettings }) {
  const items = [
    {
      icon: Building2,
      label: "Organisation",
      value: settings.orgName,
    },
    ...(settings.registrationCin
      ? [
          {
            icon: ShieldCheck,
            label: "CIN",
            value: settings.registrationCin,
          },
        ]
      : []),
    ...(settings.address
      ? [
          {
            icon: MapPin,
            label: "Office",
            value: settings.address,
          },
        ]
      : []),
  ];

  return (
    <div className="border-y border-border bg-card">
      <dl className="mx-auto grid max-w-6xl gap-4 px-4 py-5 sm:grid-cols-3 sm:px-6">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 items-start gap-3">
            <item.icon className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden />
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium leading-snug text-navy">{item.value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
