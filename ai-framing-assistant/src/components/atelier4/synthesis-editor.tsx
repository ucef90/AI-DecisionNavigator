"use client";

import { useState, useTransition } from "react";
import { Sparkles, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DECISIONS, DECISION_LABELS, type Decision } from "@/types";
import {
  OVERALL_LEVELS,
  OVERALL_LEVEL_COLORS,
  OVERALL_LEVEL_LABELS,
  type OverallLevel,
} from "@/types/atelier4";

// Éditeur de synthèse atelier 4 (§15).
// La page parent passe des "valeurs auto-suggérées" calculées
// par le moteur. L'utilisateur peut les accepter en un clic ou
// éditer manuellement.

export type SynthesisDraft = {
  globalMaturity: OverallLevel | "";
  globalFeasibility: "LOW" | "MEDIUM" | "HIGH" | "";
  globalRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "";
  recommendedDecision: Decision | "";
  decisionRationale: string;
  strongPoints: string[];
  weakPoints: string[];
  topRecommendations: string[];
};

type Props = {
  initial: SynthesisDraft;
  suggested: SynthesisDraft;
  onSave: (draft: SynthesisDraft) => Promise<void>;
};

const FEAS_OPTIONS = [
  { value: "LOW" as const, label: "Faible" },
  { value: "MEDIUM" as const, label: "Moyenne" },
  { value: "HIGH" as const, label: "Élevée" },
];

const RISK_OPTIONS = [
  { value: "LOW" as const, label: "Faible" },
  { value: "MEDIUM" as const, label: "Modéré" },
  { value: "HIGH" as const, label: "Élevé" },
  { value: "CRITICAL" as const, label: "Critique" },
];

export function SynthesisEditor({ initial, suggested, onSave }: Props) {
  const [draft, setDraft] = useState<SynthesisDraft>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SynthesisDraft>(k: K, v: SynthesisDraft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setSaved(false);
  };

  const acceptSuggested = () => {
    setDraft(suggested);
    setSaved(false);
  };

  const save = () => {
    startTransition(async () => {
      await onSave(draft);
      setSaved(true);
    });
  };

  return (
    <div className="space-y-6">
      {/* Auto-suggestion banner */}
      <div className="flex flex-col gap-3 rounded-md border border-foreground/15 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 text-foreground/60" />
          <div className="space-y-0.5 text-sm">
            <div className="font-semibold">Pré-remplissage moteur disponible</div>
            <p className="text-xs text-muted-foreground">
              Le moteur a analysé ton scoring et propose une synthèse complète. Tu peux
              l&apos;accepter telle quelle ou la prendre comme base à éditer.
            </p>
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={acceptSuggested}>
          Accepter les suggestions
        </Button>
      </div>

      {/* Niveaux globaux */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Niveaux globaux
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <LevelPicker
            label="Maturité globale"
            value={draft.globalMaturity}
            suggested={suggested.globalMaturity}
            options={OVERALL_LEVELS.map((l) => ({
              value: l,
              label: OVERALL_LEVEL_LABELS[l],
              classes: OVERALL_LEVEL_COLORS[l],
            }))}
            onChange={(v) => update("globalMaturity", v as OverallLevel | "")}
          />
          <LevelPicker
            label="Faisabilité globale"
            value={draft.globalFeasibility}
            suggested={suggested.globalFeasibility}
            options={FEAS_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
              classes:
                o.value === "HIGH"
                  ? OVERALL_LEVEL_COLORS.MATURE
                  : o.value === "MEDIUM"
                    ? OVERALL_LEVEL_COLORS.INTERMEDIATE
                    : OVERALL_LEVEL_COLORS.FRAGILE,
            }))}
            onChange={(v) => update("globalFeasibility", v as SynthesisDraft["globalFeasibility"])}
          />
          <LevelPicker
            label="Risque global"
            value={draft.globalRisk}
            suggested={suggested.globalRisk}
            options={RISK_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
              classes:
                o.value === "LOW"
                  ? OVERALL_LEVEL_COLORS.MATURE
                  : o.value === "MEDIUM"
                    ? OVERALL_LEVEL_COLORS.INTERMEDIATE
                    : o.value === "HIGH"
                      ? OVERALL_LEVEL_COLORS.FRAGILE
                      : OVERALL_LEVEL_COLORS.IMMATURE,
            }))}
            onChange={(v) => update("globalRisk", v as SynthesisDraft["globalRisk"])}
          />
        </div>
      </section>

      {/* Décision recommandée + rationnel */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Décision recommandée
        </h3>
        <div className="grid gap-3 lg:grid-cols-[16rem_1fr]">
          <LevelPicker
            label="Décision"
            value={draft.recommendedDecision}
            suggested={suggested.recommendedDecision}
            stack
            options={DECISIONS.map((d) => ({
              value: d,
              label: DECISION_LABELS[d],
              classes:
                d === "GO_IA"
                  ? OVERALL_LEVEL_COLORS.VERY_MATURE
                  : d === "POC_IA"
                    ? OVERALL_LEVEL_COLORS.MATURE
                    : d === "AUTOMATION"
                      ? OVERALL_LEVEL_COLORS.INTERMEDIATE
                      : d === "STUDY"
                        ? OVERALL_LEVEL_COLORS.FRAGILE
                        : OVERALL_LEVEL_COLORS.IMMATURE,
            }))}
            onChange={(v) => update("recommendedDecision", v as Decision | "")}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Rationnel de la décision</label>
            <Textarea
              value={draft.decisionRationale}
              onChange={(e) => update("decisionRationale", e.target.value)}
              rows={5}
              placeholder={suggested.decisionRationale}
              className="text-sm"
            />
            <p className="text-[10px] text-muted-foreground">
              Argument à utiliser en COPIL. Reprend le contexte chiffré (score, axes faibles,
              profil atelier 2, risques bloquants).
            </p>
          </div>
        </div>
      </section>

      {/* Points forts / faibles / recommandations */}
      <section className="grid gap-3 md:grid-cols-3">
        <ListField
          label="Points forts"
          value={draft.strongPoints}
          suggested={suggested.strongPoints}
          tone="emerald"
          onChange={(v) => update("strongPoints", v)}
        />
        <ListField
          label="Points faibles"
          value={draft.weakPoints}
          suggested={suggested.weakPoints}
          tone="rose"
          onChange={(v) => update("weakPoints", v)}
        />
        <ListField
          label="Recommandations prioritaires"
          value={draft.topRecommendations}
          suggested={suggested.topRecommendations}
          tone="sky"
          onChange={(v) => update("topRecommendations", v)}
        />
      </section>

      {/* Save */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        {saved ? (
          <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span>
        ) : null}
        <Button type="button" disabled={pending} onClick={save}>
          <Save className="mr-1.5 h-4 w-4" />
          Enregistrer la synthèse
        </Button>
      </div>
    </div>
  );
}

function LevelPicker({
  label,
  value,
  suggested,
  options,
  onChange,
  stack,
}: {
  label: string;
  value: string;
  suggested: string;
  options: { value: string; label: string; classes: string }[];
  onChange: (v: string) => void;
  stack?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold">{label}</label>
        {suggested && suggested !== value ? (
          <button
            type="button"
            onClick={() => onChange(suggested)}
            className="text-[10px] underline underline-offset-2 hover:text-foreground/80"
          >
            Suggéré : {options.find((o) => o.value === suggested)?.label ?? "—"}
          </button>
        ) : null}
      </div>
      <div className={cn("flex flex-wrap gap-1", stack && "flex-col")}>
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? "" : o.value)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition",
                active ? o.classes : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TONE_BG = {
  emerald: "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20",
  rose: "border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/20",
  sky: "border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20",
} as const;

function ListField({
  label,
  value,
  suggested,
  tone,
  onChange,
}: {
  label: string;
  value: string[];
  suggested: string[];
  tone: keyof typeof TONE_BG;
  onChange: (v: string[]) => void;
}) {
  const textValue = value.join("\n");
  return (
    <div className={cn("space-y-1.5 rounded-md border p-3", TONE_BG[tone])}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold">{label}</label>
        {suggested.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange(suggested)}
            className="text-[10px] underline underline-offset-2 hover:text-foreground/80"
          >
            {suggested.length} suggéré(s)
          </button>
        ) : null}
      </div>
      <Textarea
        value={textValue}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(/\r?\n/)
              .map((s) => s.trim())
              .filter(Boolean),
          )
        }
        rows={5}
        placeholder="Un élément par ligne"
        className="text-xs"
      />
    </div>
  );
}
