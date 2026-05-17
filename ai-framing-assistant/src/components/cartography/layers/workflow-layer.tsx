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
// DSFR palette : navy + accent pale + destructive. The step "kind" still
// carries semantics through fill intensity rather than a colour wheel.

const STEP_STYLES: Record<
  WorkflowStepKind,
  { bg: string; border: string; text: string; label: string }
> = {
  MANUAL: {
    bg: "bg-secondary",
    border: "border-border",
    text: "text-muted-foreground",
    label: "Étape manuelle",
  },
  AI: {
    bg: "bg-primary",
    border: "border-primary",
    text: "text-primary-foreground",
    label: "Étape IA / automatisée",
  },
  HUMAN_VALIDATION: {
    bg: "bg-accent",
    border: "border-primary",
    text: "text-primary",
    label: "Validation humaine",
  },
  AUTO: {
    bg: "bg-card",
    border: "border-primary",
    text: "text-primary",
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
      <div className="flex h-48 items-center justify-center border border-dashed border-border bg-secondary p-6 text-center text-sm text-muted-foreground">
        Documenter le workflow (actuel et cible) dans l&apos;étape architecture.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PipelineRow
        label="Workflow actuel"
        tone="rose"
        subtitle="Points de friction · lenteurs · erreurs possibles"
        steps={data.current.length > 0 ? data.current : null}
      />
      <PipelineRow
        label="Workflow cible (avec IA)"
        tone="navy"
        subtitle={
          data.approach
            ? `Approche pressentie : ${AI_APPROACH_LABELS[data.approach]}`
            : "Workflow cible avec IA"
        }
        steps={data.target.length > 0 ? data.target : null}
      />

      {data.hasRag ? (
        <div className="border-l-[3px] border-primary bg-accent p-3 text-center text-xs">
          <Sparkles className="mr-1.5 inline-block size-3.5 align-text-bottom text-primary" />
          <span className="font-bold text-primary">
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
  tone: "rose" | "navy";
}) {
  const headStyle =
    tone === "rose"
      ? "bg-destructive text-white"
      : "bg-primary text-primary-foreground";
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex px-4 py-1 text-xs font-bold uppercase tracking-wide",
            headStyle,
          )}
        >
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      {steps ? (
        <div className="flex flex-wrap items-stretch gap-2">
          {steps.map((step, i) => (
            <PipelineStep key={step.id} step={step} index={i} total={steps.length} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border bg-secondary p-3 text-xs text-muted-foreground">
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
          "flex w-36 flex-col items-center gap-1.5 border px-3 py-3 text-center text-xs",
          style.bg,
          style.border,
          style.text,
        )}
      >
        <Icon className="size-4" />
        <span className="text-[10px] uppercase tracking-wide opacity-70">
          Étape {index + 1}
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
    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3 text-[10px] text-muted-foreground">
      {(Object.keys(STEP_STYLES) as WorkflowStepKind[]).map((k) => (
        <div key={k} className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-3 border",
              STEP_STYLES[k].border,
              STEP_STYLES[k].bg,
            )}
          />
          <span>{STEP_STYLES[k].label}</span>
        </div>
      ))}
    </div>
  );
}
