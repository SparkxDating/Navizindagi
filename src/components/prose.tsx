import { parseStringList } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) {
    return <p className={cn("text-muted-foreground", className)}>To be updated</p>;
  }
  return (
    <div className={cn("space-y-4 text-base leading-relaxed text-muted-foreground", className)}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}

export function BulletList({ text, className }: { text: string; className?: string }) {
  const items = parseStringList(text);
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">To be updated</p>;
  }
  return (
    <ul className={cn("space-y-2 text-muted-foreground", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
