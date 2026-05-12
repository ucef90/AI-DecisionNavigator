import {
  Bot,
  ChevronRight,
  CircleCheck,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AI_APPROACH_LABELS } from "@/types";
import type {
  WorkflowInsights,
  WorkflowStep,
  WorkflowStepKind,
} from "@/lib/engines/cartography";

// 2. CARTOGRAPHIE WORKFLOW — Actuel (manuel) vs Cible (avec IA).
//
// Two horizontal pipelines, colour-coded steps + connector chevrons.

const STEP_STYLES: Record<
  WorkflowStepKind,
  { bg: string; border: string; text: string; label: string }
> = {
  MANUAL: {
    bg: "bg-slate-50 dark:bg-slate-900/40",
    border: "border-slate-300 dark:border-slate-700",
    text: "text-slate-900 dark:text-slate-200",
    label: "Étape manuelle",
  },
  AI: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-400 dark:border-emerald-700",
    text: "text-emerald-900 dark:text-emerald-200",
    label: "Étape IA / Automatisée",
  },
  HUMAN_VALIDATION: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-400 dark:border-amber-700",
    text: "text-amber-900 dark:text-amber-200",
    label: "Validation humaine",
  },
  AUTO: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-400 dark:border-blue-700",
    text: "text-blue-900 dark:text-blue-200",
    label: "Action système",
  },
};

const STEP_ICON: Record<WorkflowStepKind, typeof Bot> = {
  MANUAL: User,
  AI: Bot,
  HUMAN_VALIDATION: CircleCheck,
  AUTO: Send,
};

export function WorkflowLayer({ data }: { data: WorkflowInsights }) {
  if (data.current.length === 0 && data.target.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Documenter le workflow (actuel et cible) dans l&apos;étape architecture.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PipelineRow
        label="Workflow actuel"
        tone="rose"
        subtitle="Points de friction · lenteurs · erreurs possibles"
        steps={data.current.length > 0 ? data.current : null}
      />
      <PipelineRow
        label="Workflow cible (avec IA)"
        tone="emerald"
        subtitle={
          data.approach
            ? `Approche pressentie : ${AI_APPROACH_LABELS[data.approach]}`
            : "Workflow cible avec IA"
        }
        steps={data.target.length > 0 ? data.target : null}
      />

      {data.hasRag ? (
        <div className="rounded-md border border-violet-300 bg-violet-50/60 p-2 text-center text-xs dark:border-violet-800 dark:bg-violet-950/20">
          <Sparkles className="mr-1.5 inline-block size-3.5 align-text-bottom text-violet-700 dark:text-violet-300" />
          <span className="font-medium text-violet-900 dark:text-violet-200">
            Couplé à une recherche documentaire (RAG)
          </span>
        </div>
      ) : null}

      <Legend />
    </div>
  );
}

function PipelineRow({
  label,
  subtitle,
  steps,
  tone,
}: {
  label: string;
  subtitle: string;
  steps: WorkflowStep[] | null;
  tone: "rose" | "emerald";
}) {
  const headBg =
    tone === "rose"
      ? "bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
      : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", headBg)}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      {steps ? (
        <div className="flex flex-wrap items-stretch gap-1.5">
          {steps.map((step, i) => (
            <PipelineStep key={step.id} step={step} index={i} total={steps.length} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
          Non documenté.
        </div>
      )}
    </div>
  );
}

function PipelineStep({
  step,
  index,
  total,
}: {
  step: WorkflowStep;
  index: number;
  total: number;
}) {
  const style = STEP_STYLES[step.kind];
  const Icon = STEP_ICON[step.kind];
  return (
    <>
      <div
        className={cn(
          "flex w-32 flex-col items-center gap-1.5 rounded-md border px-2 py-2 text-center text-xs",
          style.bg,
          style.border,
          style.text,
        )}
      >
        <Icon className="size-4" />
        <span className="text-[10px] uppercase tracking-wide opacity-70">
          {index + 1}
        </span>
        <span className="line-clamp-3 leading-tight">{step.label}</span>
      </div>
      {index < total - 1 ? (
        <ChevronRight className="my-auto size-5 shrink-0 text-muted-foreground" />
      ) : null}
    </>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-[10px] text-muted-foreground">
      {(Object.keys(STEP_STYLES) as WorkflowStepKind[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5">
          <span
            className={cn("size-3 rounded-sm border", STEP_STYLES[k].border, STEP_STYLES[k].bg)}
          />
          <span>{STEP_STYLES[k].label}</span>
        </div>
      ))}
    </div>
  );
}
