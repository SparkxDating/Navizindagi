import type { ReactNode } from "react";
import { Children } from "react";
import { cn } from "@/lib/utils";

export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  const count = Children.count(children);
  return (
    <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-cream/70 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {count === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">{empty ?? "No records yet."}</p>
      ) : null}
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("border-t border-border px-4 py-3 align-top text-navy", className)}>{children}</td>;
}
