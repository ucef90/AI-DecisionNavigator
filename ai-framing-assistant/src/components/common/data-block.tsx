// Helpers UI partagés pour les pages "section" — affichage compact des
// données collectées (textes, listes, items typés).

import { cn } from "@/lib/utils";

export function DataBlock({ title, body }: { title: string; body?: string | null }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {body?.trim() ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">(non renseigné)</p>
      )}
    </div>
  );
}

export function ListBlock({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">{empty ?? "(aucun élément)"}</p>
      ) : (
        <ul className="ml-5 list-disc space-y-1 text-sm">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>
      )}
    </div>
  );
}

export function ItemList<T>({
  items,
  empty,
  render,
}: {
  items: T[];
  empty: string;
  render: (item: T, i: number) => React.ReactNode;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
        {empty}
      </p>
    );
  }
  return <div className="space-y-2">{items.map((item, i) => render(item, i))}</div>;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
      {message}
    </p>
  );
}

export function safeJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try { return JSON.parse(s) as T; } catch { return fallback; }
}

export function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: "good" | "warn" | "bad" }) {
  const bg = {
    good: "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20",
    warn: "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20",
    bad: "border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20",
  };
  return (
    <div className={cn("rounded-md border bg-background px-3 py-2", accent ? bg[accent] : "border-border")}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}
