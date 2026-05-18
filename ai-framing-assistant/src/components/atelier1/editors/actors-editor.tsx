"use client";

import { EditableList, EditFormFooter } from "./editable-list";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ACTOR_CATEGORIES, ACTOR_CATEGORY_LABELS, ACTOR_INVOLVEMENTS, ACTOR_INVOLVEMENT_LABELS, type ActorCategory, type ActorInvolvement } from "@/types/atelier1";

export type ActorRow = {
  id: string;
  name: string;
  category: string;
  role: string | null;
  volume: number | null;
  involvement: string | null;
  currentPain: string | null;
  expectedGain: string | null;
};

type Props = {
  items: ActorRow[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function ActorsEditor({ items, onCreate, onUpdate, onDelete }: Props) {
  return (
    <EditableList<ActorRow>
      items={items}
      emptyMessage="Aucun acteur cartographié. Commence par lister sponsor, agents, usagers."
      addLabel="Ajouter un acteur"
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      renderItem={(a) => (
        <div className="rounded-md border border-border bg-background p-3 pr-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{a.name}</span>
            <Badge variant="outline" className="text-[10px]">{ACTOR_CATEGORY_LABELS[a.category as ActorCategory] ?? a.category}</Badge>
            {a.involvement ? <Badge variant="outline" className="text-[10px]">{ACTOR_INVOLVEMENT_LABELS[a.involvement as ActorInvolvement] ?? a.involvement}</Badge> : null}
            {a.volume ? <Badge variant="outline" className="text-[10px]">{a.volume} personne(s)</Badge> : null}
          </div>
          {a.role ? <p className="mt-1 text-xs text-muted-foreground">{a.role}</p> : null}
          <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
            {a.currentPain ? <div className="rounded bg-rose-50/40 px-2 py-1 dark:bg-rose-950/20"><strong>Douleur :</strong> {a.currentPain}</div> : null}
            {a.expectedGain ? <div className="rounded bg-emerald-50/40 px-2 py-1 dark:bg-emerald-950/20"><strong>Gain :</strong> {a.expectedGain}</div> : null}
          </div>
        </div>
      )}
      renderForm={(item, { formAction, cancel, pending }) => (
        <form action={formAction} className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Nom *" name="name" defaultValue={item?.name ?? ""} required />
            <Field label="Rôle (description)" name="role" defaultValue={item?.role ?? ""} />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <SelectField label="Catégorie" name="category" defaultValue={item?.category ?? "USER"} options={ACTOR_CATEGORIES.map((c) => ({ value: c, label: ACTOR_CATEGORY_LABELS[c] }))} />
            <SelectField label="Implication" name="involvement" defaultValue={item?.involvement ?? "PRIMARY"} options={ACTOR_INVOLVEMENTS.map((c) => ({ value: c, label: ACTOR_INVOLVEMENT_LABELS[c] }))} />
            <Field label="Volume (nb)" name="volume" type="number" defaultValue={item?.volume?.toString() ?? ""} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <TextareaField label="Douleur actuelle" name="currentPain" defaultValue={item?.currentPain ?? ""} />
            <TextareaField label="Gain attendu" name="expectedGain" defaultValue={item?.expectedGain ?? ""} />
          </div>
          <EditFormFooter cancel={cancel} pending={pending} />
        </form>
      )}
    />
  );
}

function Field({ label, name, defaultValue, type = "text", required }: { label: string; name: string; defaultValue: string; type?: string; required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Input name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function SelectField({ label, name, defaultValue, options }: { label: string; name: string; defaultValue: string; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <select name={name} defaultValue={defaultValue} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, name, defaultValue }: { label: string; name: string; defaultValue: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <Textarea name={name} rows={2} defaultValue={defaultValue} className="text-xs" />
    </div>
  );
}
