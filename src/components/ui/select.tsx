import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-11 w-full appearance-none rounded-xl border border-input bg-card bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22><path fill=%22%230b1f3a%22 d=%22M1 1l5 5 5-5%22/></svg>')] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat px-3.5 pr-10 text-sm text-foreground shadow-[0_0_0_1px_rgb(11_31_58_/_0.02)] transition-colors focus-visible:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
