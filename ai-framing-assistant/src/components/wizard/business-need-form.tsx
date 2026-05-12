"use client";

import { useActionState } from "react";

import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardNav } from "@/components/wizard/wizard-nav";
import type { WizardState } from "@/lib/actions/wizard";

export type BusinessNeedDefaults = {
  initialRequest: string;
  reformulatedNeed: string;
  painPoints: string;
  expectedValue: string;
  usersImpacted: string;
  currentKpis: string;
  expectedOutcome: string;
};

export function BusinessNeedForm({
  projectId,
  action,
  defaults,
}: {
  projectId: string;
  action: (
    prev: WizardState | undefined,
    form: FormData,
  ) => Promise<WizardState>;
  defaults: BusinessNeedDefaults;
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

      <section className="rounded-lg border border-border bg-muted/30 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Demande initiale (saisie à l&apos;étape de création)
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">
          {defaults.initialRequest || (
            <em className="text-muted-foreground">
              Aucune demande initiale renseignée — reviens éditer la fiche projet pour l&apos;ajouter.
            </em>
          )}
        </p>
      </section>

      <Field
        name="reformulatedNeed"
        label="Besoin reformulé"
        hint="Ré-écris le vrai besoin métier sous-jacent à la demande, en distinguant la solution demandée du problème réel à résoudre. (L'assistant IA fera la reformulation automatiquement quand un provider sera configuré dans Paramètres.)"
        defaultValue={defaults.reformulatedNeed}
        errors={fe.reformulatedNeed}
        rows={4}
        placeholder="Ex. : Réduire le délai de traitement des courriers d'usagers, dont 70% relèvent en réalité de 5 demandes-types."
      />

      <Field
        name="painPoints"
        label="Irritants & tâches chronophages"
        hint="Liste les points de friction concrets vécus par les agents (une ligne par irritant). Ex : « Re-saisie manuelle des données du courrier dans GED », « Recherche de pièces jointes dispersées »."
        defaultValue={defaults.painPoints}
        errors={fe.painPoints}
        rows={4}
        placeholder={"Un irritant par ligne.\nEx. : Tri manuel chronophage\nEx. : Re-saisie dans GED"}
        multiline
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          name="expectedValue"
          label="Objectif attendu"
          hint="Valeur métier ciblée (déjà saisie à la création, modifiable ici). Chiffre si possible : gain de temps en jours/an, taux d'erreur, délai cible…"
          defaultValue={defaults.expectedValue}
          errors={fe.expectedValue}
          rows={3}
        />
        <Field
          name="usersImpacted"
          label="Utilisateurs concernés"
          hint="Qui utilisera la solution + estimation de volume (~50 agents, ~10K usagers/an…)."
          defaultValue={defaults.usersImpacted}
          errors={fe.usersImpacted}
          rows={3}
        />
      </div>

      <Field
        name="currentKpis"
        label="KPIs actuels"
        hint="Indicateurs existants à comparer après le projet. Une ligne par KPI au format « Nom : valeur actuelle ». Ex : « Délai moyen de traitement : 18 jours »."
        defaultValue={defaults.currentKpis}
        errors={fe.currentKpis}
        rows={3}
        placeholder={"Un KPI par ligne, format « Nom : valeur ».\nEx. : Délai moyen de traitement : 18 jours\nEx. : Taux d'erreur de classification : 12%"}
        multiline
      />

      <Field
        name="expectedOutcome"
        label="Résultat attendu (en chiffres)"
        hint="Cible quantifiée que le projet doit atteindre. Sera comparée aux KPIs actuels pour l'analyse de valeur."
        defaultValue={defaults.expectedOutcome}
        errors={fe.expectedOutcome}
        rows={3}
        placeholder="Ex. : Délai de traitement < 5 jours en moyenne, taux d'erreur < 3%."
      />

      <input type="hidden" name="_projectId" value={projectId} />
      <WizardNav projectId={projectId} stepId="business-need" pending={pending} />
    </form>
  );
}

function Field({
  name,
  label,
  hint,
  defaultValue,
  errors,
  rows = 3,
  placeholder,
  multiline,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: string;
  errors?: string[];
  rows?: number;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <FieldHint>{hint}</FieldHint>
        {multiline ? (
          <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
            une entrée par ligne
          </span>
        ) : null}
      </div>
      <Textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {errors && errors.length > 0 ? (
        <p className="text-xs text-destructive">{errors.join(" — ")}</p>
      ) : null}
    </div>
  );
}
