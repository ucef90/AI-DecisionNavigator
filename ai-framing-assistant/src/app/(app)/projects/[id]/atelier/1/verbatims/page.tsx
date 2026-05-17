import { notFound } from "next/navigation";

import { SectionShell } from "@/components/atelier1/section-shell";
import { ItemList } from "@/components/common/data-block";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAtelierSnapshot } from "@/lib/engines/atelier1";

const SENTIMENT_COLOR = {
  NEGATIVE: "border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20",
  NEUTRAL: "border-border bg-muted/20",
  POSITIVE: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20",
} as const;

export default async function VerbatimsPage(props: PageProps<"/projects/[id]/atelier/1/verbatims">) {
  const { id } = await props.params;
  const snap = await loadAtelierSnapshot(id);
  if (!snap) notFound();

  return (
    <SectionShell
      phaseLabel="Phase B — Cartographie métier"
      title="Voix du terrain (verbatim)"
      livrableRef="Ajout méthodologique"
      intent="Citations brutes d'usagers et agents — donne de la crédibilité au COPIL."
      pourquoi={[
        "Les chiffres convainquent, les verbatim émeuvent — le COPIL a besoin des deux.",
        "Un verbatim agent vaut mille pages de diagnostic.",
        "Source : interview, observation terrain, plaintes écrites.",
      ]}
      cherche={[
        "2-5 verbatims représentatifs (pas tous négatifs).",
        "Source clairement identifiée (rôle, date).",
        "Thème (délai, charge, qualité, frustration…).",
      ]}
    >
      <ItemList
        items={snap.verbatims}
        empty="Aucun verbatim collecté."
        render={(v) => (
          <blockquote key={v.id} className={cn("rounded-md border p-3", SENTIMENT_COLOR[v.sentiment as keyof typeof SENTIMENT_COLOR] ?? "border-border")}>
            <p className="text-sm italic">« {v.quote} »</p>
            <footer className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <Badge variant="outline" className="text-[9px]">{v.source}</Badge>
              <Badge variant="outline" className="text-[9px]">{v.sentiment}</Badge>
              {v.theme ? <Badge variant="outline" className="text-[9px]">{v.theme}</Badge> : null}
              {v.speakerRole ? <span>— {v.speakerRole}</span> : null}
              {v.speakerName ? <span>{v.speakerName}</span> : null}
            </footer>
          </blockquote>
        )}
      />
    </SectionShell>
  );
}
