"use client";

import { useActionState } from "react";

import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardNav } from "@/components/wizard/wizard-nav";
import type { WizardState } from "@/lib/actions/wizard";
import { OVERALL_RISK_LABELS, OVERALL_RISKS, type OverallRisk } from "@/types";

const RISK_AXES: {
  name: RiskAxisKey;
  label: string;
  hint: string;
}[] = [
  {
    name: "rgpdRisk",
    label: "RGPD",
    hint: "Risque de non-conformité au RGPD (base légale, droits, transferts, AIPD manquante).",
  },
  {
    name: "sensitiveDataRisk",
    label: "Données sensibles",
    hint: "Traitement de données de santé, judiciaires, biométriques, ou révélant des opinions / l'origine.",
  },
  {
    name: "hallucinationRisk",
    label: "Hallucinations",
    hint: "Pour les LLM : risque que le modèle invente des informations fausses présentées comme vraies. Particulièrement critique sur les sujets juridiques ou médicaux.",
  },
  {
    name: "biasRisk",
    label: "Biais",
    hint: "Biais dans les données d'entraînement ou les sorties (sexisme, racisme, biais socio-économiques). Impact direct sur l'équité de traitement.",
  },
  {
    name: "classificationRisk",
    label: "Erreur de classification",
    hint: "Risque qu'une catégorisation erronée envoie un dossier au mauvais service ou déclenche la mauvaise décision.",
  },
  {
    name: "autoDecisionRisk",
    label: "Décision automatisée",
    hint: "Une décision IA affectant un usager sans intervention humaine significative tombe sous l'art. 22 RGPD. Risque juridique fort.",
  },
  {
    name: "securityRisk",
    label: "Sécurité",
    hint: "Fuite de données via prompt injection, exfiltration par un LLM cloud, vulnérabilités d'une chaîne d'agent IA.",
  },
  {
    name: "vendorLockRisk",
    label: "Dépendance fournisseur",
    hint: "Si tout repose sur OpenAI / Azure : risque de coût qui dérive, rupture de service, conditions modifiées unilatéralement. Solution : abstraction provider.",
  },
  {
    name: "adoptionRisk",
    label: "Adoption utilisateurs",
    hint: "Risque que les agents n'utilisent pas l'outil (méfiance IA, surcharge, ergonomie). Beaucoup de projets meurent ici, pas sur la techno.",
  },
  {
    name: "supervisionRisk",
    label: "Supervision humaine",
    hint: "Risque d'absence de processus de revue, d'escalade, de correction. Sans supervision, l'IA dérive silencieusement.",
  },
];

type RiskAxisKey =
  | "rgpdRisk"
  | "sensitiveDataRisk"
  | "hallucinationRisk"
  | "biasRisk"
  | "classificationRisk"
  | "autoDecisionRisk"
  | "securityRisk"
  | "vendorLockRisk"
  | "adoptionRisk"
  | "supervisionRisk";

export type RiskAssessmentDefaults = Record<RiskAxisKey, number | ""> & {
  overallRisk: OverallRisk | "";
  mitigationPlan: string;
};

const SCORE_LABELS = ["1 — Négligeable", "2 — Faible", "3 — Modéré", "4 — Élevé", "5 — Critique"];

export function RiskAssessmentForm({
  projectId,
  action,
  defaults,
}: {
  projectId: string;
  action: (
    prev: WizardState | undefined,
    form: FormData,
  ) => Promise<WizardState>;
  defaults: RiskAssessmentDefaults;
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

      <section className="space-y-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold">10 axes de risque</h3>
          <FieldHint>
            Note chaque axe de 1 (négligeable) à 5 (critique). Au moins un
            axe ≥ 4 → étude complémentaire ou mitigations explicites
            requises avant tout déploiement.
          </FieldHint>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {RISK_AXES.map((axis) => (
            <div
              key={axis.name}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{axis.label}</span>
                <FieldHint>{axis.hint}</FieldHint>
              </div>
              <select
                id={axis.name}
                name={axis.name}
                defaultValue={defaults[axis.name]}
                className="h-8 w-44 shrink-0 rounded-md border border-input bg-background px-2 text-xs"
              >
                <option value="">—</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {SCORE_LABELS[n - 1]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="overallRisk">Risque global synthétisé</Label>
          <FieldHint>
            Synthèse subjective globale. Le scoring (étape suivante) recalculera
            de son côté en tenant compte de tous les axes.
          </FieldHint>
        </div>
        <select
          id="overallRisk"
          name="overallRisk"
          defaultValue={defaults.overallRisk}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          <option value="">— Non synthétisé —</option>
          {OVERALL_RISKS.map((r) => (
            <option key={r} value={r}>
              {OVERALL_RISK_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="mitigationPlan">Plan de mitigation</Label>
          <FieldHint>
            Pour chaque risque ≥ 3, précise une mesure concrète. Sera reprise
            dans la fiche de décision et le plan d&apos;action final.
          </FieldHint>
        </div>
        <Textarea
          id="mitigationPlan"
          name="mitigationPlan"
          rows={6}
          defaultValue={defaults.mitigationPlan}
          placeholder="Ex. : Hallucinations → revue humaine systématique avant envoi à l'usager.\nRGPD → AIPD validée par DPO avant POC.\nAdoption → 2 ateliers par mois avec les agents pilotes."
        />
        {fe.mitigationPlan ? (
          <p className="text-xs text-destructive">
            {fe.mitigationPlan.join(" — ")}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="_projectId" value={projectId} />
      <WizardNav projectId={projectId} stepId="risks" pending={pending} />
    </form>
  );
}
