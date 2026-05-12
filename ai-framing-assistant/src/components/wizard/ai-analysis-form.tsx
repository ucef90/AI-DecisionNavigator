"use client";

import { useActionState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FieldHint } from "@/components/ui/field-hint";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardNav } from "@/components/wizard/wizard-nav";
import type { WizardState } from "@/lib/actions/wizard";
import {
  AI_APPROACH_LABELS,
  AI_APPROACHES,
  type AIApproach,
} from "@/types";

export type AIAnalysisDefaults = {
  automationRelevant: boolean;
  ruleEngineRelevant: boolean;
  mlRelevant: boolean;
  llmRelevant: boolean;
  ragRelevant: boolean;
  agentRelevant: boolean;
  hybridRelevant: boolean;
  classicRelevant: boolean;
  recommendedApproach: AIApproach | "";
  justification: string;
};

type ApproachKey = Exclude<
  keyof AIAnalysisDefaults,
  "recommendedApproach" | "justification"
>;

const APPROACH_CHECKBOXES: {
  name: ApproachKey;
  label: string;
  hint: string;
}[] = [
  {
    name: "automationRelevant",
    label: "Automatisation simple",
    hint: "RPA, scripts, ETL : la tâche est répétitive et déterministe, pas besoin d'IA.",
  },
  {
    name: "ruleEngineRelevant",
    label: "Règle métier",
    hint: "Logique conditionnelle explicite (if/then). Robuste, traçable, pas d'apprentissage.",
  },
  {
    name: "mlRelevant",
    label: "Machine Learning",
    hint: "Modèle entraîné sur des données historiques (classification, prévision). Nécessite un jeu de données labellisées.",
  },
  {
    name: "llmRelevant",
    label: "LLM",
    hint: "Modèle de langage généraliste (GPT, Mistral, Claude). Adapté au texte libre, résumé, extraction, génération.",
  },
  {
    name: "ragRelevant",
    label: "RAG",
    hint: "Retrieval-Augmented Generation : LLM + base documentaire. Pour répondre sur des documents internes sans ré-entraîner.",
  },
  {
    name: "agentRelevant",
    label: "Agent IA",
    hint: "LLM avec accès à des outils (API, recherche…) qui orchestre plusieurs étapes. Plus complexe à fiabiliser.",
  },
  {
    name: "hybridRelevant",
    label: "Workflow hybride",
    hint: "Combinaison IA + règles + humain. Recommandé dès qu'il y a un enjeu de fiabilité ou de conformité.",
  },
  {
    name: "classicRelevant",
    label: "Solution classique non IA",
    hint: "Refonte applicative, meilleur process, formation. À considérer si l'IA n'apporte pas de valeur claire.",
  },
];

export function AIAnalysisForm({
  projectId,
  action,
  defaults,
}: {
  projectId: string;
  action: (
    prev: WizardState | undefined,
    form: FormData,
  ) => Promise<WizardState>;
  defaults: AIAnalysisDefaults;
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

      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-semibold">Approches pertinentes</h3>
          <FieldHint>
            Coche toutes les approches qui pourraient répondre au besoin —
            l&apos;exclusion vient ensuite. Souvent plusieurs cases sont
            cochées avant d&apos;arbitrer.
          </FieldHint>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {APPROACH_CHECKBOXES.map((opt) => (
            <label
              key={opt.name}
              className="group/field flex items-start gap-3 rounded-md border border-border p-3 hover:bg-muted/50"
            >
              <Checkbox name={opt.name} defaultChecked={defaults[opt.name]} />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{opt.label}</span>
                  <FieldHint>{opt.hint}</FieldHint>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="recommendedApproach">Approche recommandée</Label>
          <FieldHint>
            L&apos;approche finale retenue après arbitrage. Si plusieurs ont
            été cochées, choisis celle qui sera privilégiée pour la suite
            (POC, scoring, décision).
          </FieldHint>
        </div>
        <select
          id="recommendedApproach"
          name="recommendedApproach"
          defaultValue={defaults.recommendedApproach}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
        >
          <option value="">— À déterminer —</option>
          {AI_APPROACHES.map((a) => (
            <option key={a} value={a}>
              {AI_APPROACH_LABELS[a]}
            </option>
          ))}
        </select>
        {fe.recommendedApproach ? (
          <p className="text-xs text-destructive">
            {fe.recommendedApproach.join(" — ")}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="justification">Justification</Label>
          <FieldHint>
            Pourquoi cette approche plutôt qu&apos;une autre ? Cette
            justification sera reprise dans la note de cadrage finale.
          </FieldHint>
        </div>
        <Textarea
          id="justification"
          name="justification"
          rows={4}
          defaultValue={defaults.justification}
          placeholder="Ex. : Le besoin porte sur du texte libre non structuré (courriers), avec une volumétrie de 5K/an et un budget limité. Un LLM + workflow hybride permet de démarrer rapidement sans entraînement préalable."
        />
        {fe.justification ? (
          <p className="text-xs text-destructive">
            {fe.justification.join(" — ")}
          </p>
        ) : null}
      </div>

      <input type="hidden" name="_projectId" value={projectId} />
      <WizardNav projectId={projectId} stepId="ai-analysis" pending={pending} />
    </form>
  );
}
