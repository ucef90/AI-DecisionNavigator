"use client";

import { useActionState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardNav } from "@/components/wizard/wizard-nav";
import type { WizardState } from "@/lib/actions/wizard";

export type ArchitectureDefaults = {
  applications: string;
  apis: string;
  workflowCurrent: string;
  workflowTarget: string;
  siIntegration: string;
  humanValidation: boolean;
  traceability: string;
  existingTools: string;
};

export function ArchitectureForm({
  projectId,
  action,
  defaults,
}: {
  projectId: string;
  action: (
    prev: WizardState | undefined,
    form: FormData,
  ) => Promise<WizardState>;
  defaults: ArchitectureDefaults;
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

      <div className="grid gap-4 sm:grid-cols-2">
        <ListField
          name="applications"
          label="Applications concernées"
          hint="Logiciels métier impliqués dans la chaîne de traitement (en entrée, sortie, ou intermédiaire)."
          defaultValue={defaults.applications}
          errors={fe.applications}
          placeholder={"Ex. : Maarch (GED)\nEx. : Octime (SIRH)\nEx. : Outlook"}
        />
        <ListField
          name="apis"
          label="APIs disponibles"
          hint="APIs exposées par les applications listées (REST, SOAP, webhooks…). Une API par ligne, avec son nom court."
          defaultValue={defaults.apis}
          errors={fe.apis}
          placeholder={"Ex. : Maarch REST API\nEx. : Microsoft Graph"}
        />
      </div>

      <BlockField
        name="workflowCurrent"
        label="Workflow existant"
        hint="Décris le processus actuel, étape par étape. Permet de comparer ensuite avec le workflow cible."
        defaultValue={defaults.workflowCurrent}
        errors={fe.workflowCurrent}
        rows={4}
        placeholder="Ex. : 1) Réception courrier → 2) Tri manuel par agent → 3) Saisie GED → 4) Affectation service"
      />

      <BlockField
        name="workflowTarget"
        label="Workflow cible"
        hint="Le futur processus avec la solution. Indique où l'IA intervient et où l'humain garde la main."
        defaultValue={defaults.workflowTarget}
        errors={fe.workflowTarget}
        rows={4}
        placeholder="Ex. : 1) Réception courrier → 2) IA propose classification + résumé → 3) Agent valide ou corrige → 4) Saisie GED automatisée"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SmallField
          name="siIntegration"
          label="Intégration SI"
          hint="Contraintes d'intégration au système d'information : flux ETL, ESB, identité unique, SSO…"
          defaultValue={defaults.siIntegration}
          errors={fe.siIntegration}
        />
        <SmallField
          name="traceability"
          label="Traçabilité"
          hint="Comment journaliser les décisions de l'IA, les corrections humaines, les anomalies ? Indispensable pour audit et amélioration continue."
          defaultValue={defaults.traceability}
          errors={fe.traceability}
        />
      </div>

      <section className="space-y-2 rounded-md border border-border p-4">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-semibold">Supervision humaine</h4>
          <FieldHint>
            Si l&apos;IA produit une décision automatisée affectant l&apos;usager,
            l&apos;article 22 du RGPD impose une supervision humaine
            significative. Pour les cas sensibles (santé, social), c&apos;est non
            négociable.
          </FieldHint>
        </div>
        <label className="flex items-center gap-2">
          <Checkbox
            name="humanValidation"
            defaultChecked={defaults.humanValidation}
          />
          <span className="text-sm">
            Une validation humaine est prévue dans le workflow cible
          </span>
        </label>
      </section>

      <ListField
        name="existingTools"
        label="Outils existants à réutiliser"
        hint="OCR, moteurs de règles, modèles ML déjà déployés, briques internes mutualisables. Évite de réinventer."
        defaultValue={defaults.existingTools}
        errors={fe.existingTools}
        placeholder={"Ex. : OCR ABBYY déjà en place\nEx. : Annuaire LDAP de l'organisation"}
      />

      <input type="hidden" name="_projectId" value={projectId} />
      <WizardNav projectId={projectId} stepId="architecture" pending={pending} />
    </form>
  );
}

function ListField({
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
        <span className="ml-auto text-[10px] uppercase tracking-wide text-muted-foreground">
          une par ligne
        </span>
      </div>
      <Textarea id={name} name={name} rows={3} defaultValue={defaultValue} placeholder={placeholder} />
      {errors && errors.length > 0 ? (
        <p className="text-xs text-destructive">{errors.join(" — ")}</p>
      ) : null}
    </div>
  );
}

function SmallField({
  name,
  label,
  hint,
  defaultValue,
  errors,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: string;
  errors?: string[];
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={name}>{label}</Label>
        <FieldHint>{hint}</FieldHint>
      </div>
      <Textarea id={name} name={name} rows={3} defaultValue={defaultValue} />
      {errors && errors.length > 0 ? (
        <p className="text-xs text-destructive">{errors.join(" — ")}</p>
      ) : null}
    </div>
  );
}

function BlockField({
  name,
  label,
  hint,
  defaultValue,
  errors,
  rows = 4,
  placeholder,
}: {
  name: string;
  label: string;
  hint: string;
  defaultValue: string;
  errors?: string[];
  rows?: number;
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
