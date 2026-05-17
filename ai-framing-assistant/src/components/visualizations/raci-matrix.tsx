// Matrice RACI — table HTML avec pastilles R/A/C/I colorées.
// Lignes : acteurs/rôles ; colonnes : scopes (domaines de responsabilité).

import { cn } from "@/lib/utils";
import { RACI_COLORS, RACI_LABELS, RACI_TYPES, type RaciType } from "@/types/atelier6";

export type RaciEntry = {
  actorRole: string;       // ex. "DPO", "RSSI"
  scope: string;           // ex. "Conformité RGPD"
  responsibility: RaciType;
};

type Props = {
  actors: string[];        // ordre des lignes
  scopes: string[];        // ordre des colonnes
  entries: RaciEntry[];
};

export function RaciMatrix({ actors, scopes, entries }: Props) {
  // Index : actor → scope → RaciType[]
  const index = new Map<string, Map<string, RaciType[]>>();
  for (const e of entries) {
    if (!index.has(e.actorRole)) index.set(e.actorRole, new Map());
    const row = index.get(e.actorRole)!;
    if (!row.has(e.scope)) row.set(e.scope, []);
    row.get(e.scope)!.push(e.responsibility);
  }

  if (actors.length === 0 || scopes.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-center text-xs italic text-muted-foreground">
        La matrice RACI s&apos;affichera ici dès que des rôles auront été assignés.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-background px-2 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              Rôle / Scope
            </th>
            {scopes.map((scope) => (
              <th
                key={scope}
                className="border-b border-border bg-muted/30 px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {scope}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {actors.map((actor, rowIdx) => (
            <tr
              key={actor}
              className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20"}
            >
              <th
                className="sticky left-0 z-10 border-b border-border bg-inherit px-2 py-2 text-left font-semibold"
                scope="row"
              >
                {actor}
              </th>
              {scopes.map((scope) => {
                const cell = index.get(actor)?.get(scope) ?? [];
                return (
                  <td
                    key={scope}
                    className="border-b border-border px-2 py-1.5 text-center"
                  >
                    {cell.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/50">·</span>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        {cell.map((r, i) => (
                          <span
                            key={i}
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                              RACI_COLORS[r],
                            )}
                            title={RACI_LABELS[r]}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <span className="font-semibold">Légende :</span>
        {RACI_TYPES.map((r) => (
          <span key={r} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                RACI_COLORS[r],
              )}
            >
              {r}
            </span>
            {RACI_LABELS[r]}
          </span>
        ))}
      </div>
    </div>
  );
}
