"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Field, SelectField, TextareaField } from "./form-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { VERBATIM_SENTIMENTS, VERBATIM_SOURCES } from "@/types/atelier1";

export type VerbatimRow = { id: string; quote: string; speakerRole: string | null; speakerName: string | null; source: string; sentiment: string; theme: string | null };

const SENT_BG = {
  NEGATIVE: "border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20",
  NEUTRAL: "border-border bg-muted/20",
  POSITIVE: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20",
} as const;

export function VerbatimsEditor({ items, onCreate, onUpdate, onDelete }: {
  items: VerbatimRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <EditableList<VerbatimRow>
      items={items}
      emptyMessage="Aucun verbatim. Cite agents et usagers pour la crédibilité COPIL."
      addLabel="Ajouter un verbatim"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(v) => (
        <blockquote className={cn("rounded-md border p-3 pr-20", SENT_BG[v.sentiment as keyof typeof SENT_BG] ?? "border-border")}>
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
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <TextareaField label="Citation *" name="quote" defaultValue={item?.quote ?? ""} rows={3} placeholder="« On passe 40% de notre journée à lire des emails. »" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Rôle du locuteur" name="speakerRole" defaultValue={item?.speakerRole ?? ""} placeholder="ex. Agent de traitement" />
            <Field label="Nom (optionnel)" name="speakerName" defaultValue={item?.speakerName ?? ""} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Source" name="source" defaultValue={item?.source ?? "INTERVIEW"} options={VERBATIM_SOURCES.map((s) => ({ value: s, label: s }))} />
            <SelectField label="Sentiment" name="sentiment" defaultValue={item?.sentiment ?? "NEGATIVE"} options={VERBATIM_SENTIMENTS.map((s) => ({ value: s, label: s }))} />
            <Field label="Thème" name="theme" defaultValue={item?.theme ?? ""} placeholder="ex. délai" />
          </div>
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}
