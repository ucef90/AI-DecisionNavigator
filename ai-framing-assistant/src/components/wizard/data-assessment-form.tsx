"use client";

import { useActionState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardNav } from "@/components/wizard/wizard-nav";
import type { WizardState } from "@/lib/actions/wizard";
import { SENSITIVITY_LEVELS, type Sensitivity } from "@/types";

const SENSITIVITY_LABELS: Record<Sensitivity, string> = {
  NONE: "Non sensible",
  INTERNAL: "Interne",
  CONFIDENTIAL: "Confidentiel",
  SENSITIVE: "Sensible (santé, judiciaire, biométrique…)",
};

export type DataAssessmentDefaults = {
  dataSources: string;
  structured: boolean;
  unstructured: boolean;
  history: string;
  quality: string;
  availability: string;
  silos: string;
  personalData: boolean;
  sensitivity: Sensitivity | "";
  rgpdConstraints: string;
};

export function DataAssessmentForm({
  projectId,
  action,
  defaults,
}: {
  projectId: string;
  action: (
    prev: WizardState | undefined,
    form: FormData,
  ) => Promise<WizardState>;
  defaults: DataAssessmentDefaults;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="dataSources">Sources de données</Label>
          <FieldHint>
            Liste les applications, bases ou systèmes qui contiennent les
            données nécessaires au projet. Une source par ligne.
          </FieldHint>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
            une par ligne
          </span>
        </div>
        <Textarea
          id="dataSources"
          name="dataSources"
          rows={4}
          defaultValue={defaults.dataSources}
          placeholder={"Ex. : GED Maarch\nEx. : SIRH Octime\nEx. : Boîte mail générique"}
        />
        {fe.dataSources ? (
          <p className="text-xs text-destructive">{fe.dataSources.join(" — ")}</p>
        ) : null}
      </div>

      <section className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Type de données</Label>
          <FieldHint>
            Structuré = tables, CSV, bases relationnelles. Non structuré =
            texte libre, courriers, PDF, images, audio. Beaucoup de projets
            mélangent les deux.
          </FieldHint>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-md border border-border p-3 hover:bg-muted/50">
            <Checkbox name="structured" defaultChecked={defaults.structured} />
            <span className="text-sm">Données structurées</span>
          </label>
          <label className="flex items-center gap-2 rounded-md border border-border p-3 hover:bg-muted/50">
            <Checkbox name="unstructured" defaultChecked={defaults.unstructured} />
            <span className="text-sm">Données non structurées</span>
          </label>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <SimpleField
          name="history"
          label="Historique disponible"
          hint="Profondeur d'historique (ex : 3 ans de courriers archivés). Critique pour ML : peu d'historique = pas d'entraînement possible."
          defaultValue={defaults.history}
          errors={fe.history}
          placeholder="Ex. : 3 ans de courriers archivés dans GED"
        />
        <SimpleField
          name="quality"
          label="Qualité des données"
          hint="Champs manquants, doublons, incohérences, formats hétérogènes. Si la qualité est mauvaise, le projet doit d'abord nettoyer (étude data préalable)."
          defaultValue={defaults.quality}
          errors={fe.quality}
          placeholder="Ex. : 30% de champs manquants sur la catégorisation"
        />
        <SimpleField
          name="availability"
          label="Accessibilité technique"
          hint="API disponible ? Export possible ? Accès direct à la base ? Délai d'accès via le DPO ? Ces frictions peuvent retarder un projet de plusieurs mois."
          defaultValue={defaults.availability}
          errors={fe.availability}
          placeholder="Ex. : API REST exposée par Maarch + export CSV ponctuel"
        />
        <SimpleField
          name="silos"
          label="Silos de données"
          hint="La donnée est-elle éclatée entre plusieurs systèmes ou directions ? Faut-il consolider avant d'attaquer le projet ?"
          defaultValue={defaults.silos}
          errors={fe.silos}
          placeholder="Ex. : Métier + DSI + Archives séparés sans référentiel commun"
        />
      </div>

      <section className="space-y-3 rounded-lg border border-amber-300/40 bg-amber-50/50 p-4 dark:bg-amber-950/20">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-semibold">Données personnelles & RGPD</h4>
          <FieldHint>
            Section critique pour la gouvernance et le DPO. Détermine si une
            AIPD (Analyse d&apos;Impact relative à la Protection des Données)
            sera nécessaire avant tout traitement.
          </FieldHint>
        </div>

        <label className="flex items-center gap-2">
          <Checkbox name="personalData" defaultChecked={defaults.personalData} />
          <span className="text-sm">Le projet traite des données à caractère personnel</span>
        </label>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="sensitivity">Niveau de sensibilité</Label>
            <FieldHint>
              Sensible (santé, judiciaire, biométrique, opinion) → AIPD
              obligatoire et restrictions fortes sur les LLM cloud.
            </FieldHint>
          </div>
          <select
            id="sensitivity"
            name="sensitivity"
            defaultValue={defaults.sensitivity}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
          >
            <option value="">— Non renseigné —</option>
            {SENSITIVITY_LEVELS.map((s) => (
              <option key={s} value={s}>
                {SENSITIVITY_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="rgpdConstraints">Contraintes RGPD identifiées</Label>
            <FieldHint>
              Base légale du traitement, durée de conservation, transferts
              hors UE, droits des personnes, anonymisation/pseudonymisation
              nécessaire…
            </FieldHint>
          </div>
          <Textarea
            id="rgpdConstraints"
            name="rgpdConstraints"
            rows={3}
            defaultValue={defaults.rgpdConstraints}
            placeholder="Ex. : Base légale = mission de service public. Durée = 5 ans. Pas de transfert hors UE. Anonymisation requise pour entraînement modèle."
          />
        </div>
      </section>

      <input type="hidden" name="_projectId" value={projectId} />
      <WizardNav projectId={projectId} stepId="data" pending={pending} />
    </form>
  );
}

function SimpleField({
  name,
  label,
  hint,
  defaultValue,
  errors,
  placeholder,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: string;
  errors?: string[];
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <FieldHint>{hint}</FieldHint>
      </div>
      <Textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {errors && errors.length > 0 ? (
        <p className="text-xs text-destructive">{errors.join(" — ")}</p>
      ) : null}
    </div>
  );
}
