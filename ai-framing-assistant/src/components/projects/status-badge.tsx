import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DECISION_LABELS,
  PROJECT_STATUS_LABELS,
  type Decision,
  type ProjectStatus,
} from "@/types";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  DRAFT: "bg-muted text-foreground/70",
  IN_PROGRESS: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  SCORED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  DECIDED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  ARCHIVED: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const DECISION_STYLES: Record<Decision, string> = {
  GO_IA: "bg-emerald-600 text-white",
  POC_IA: "bg-blue-600 text-white",
  AUTOMATION: "bg-amber-500 text-white",
  STUDY: "bg-zinc-500 text-white",
  NO_GO: "bg-destructive text-white",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status as ProjectStatus;
  return (
    <Badge variant="secondary" className={cn("border-0", STATUS_STYLES[key])}>
      {PROJECT_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}

export function DecisionBadge({ decision }: { decision: string | null }) {
  if (!decision) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        En attente
      </Badge>
    );
  }
  const key = decision as Decision;
  return (
    <Badge className={cn("border-0", DECISION_STYLES[key])}>
      {DECISION_LABELS[key] ?? decision}
    </Badge>
  );
}
