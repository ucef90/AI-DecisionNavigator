import { Badge } from "@/components/ui/badge";
import {
  DECISION_LABELS,
  PROJECT_STATUS_LABELS,
  type Decision,
  type ProjectStatus,
} from "@/types";

// Semantic palette : success = green, primary = blue (POC / progress),
// warning = amber (automation), muted = neutral (study / draft), destructive = red.

const STATUS_VARIANTS: Record<ProjectStatus, "muted" | "default" | "primary" | "success"> = {
  DRAFT: "muted",
  IN_PROGRESS: "default",
  SCORED: "primary",
  DECIDED: "success",
  ARCHIVED: "muted",
};

const DECISION_VARIANTS: Record<
  Decision,
  "success" | "primary" | "warning" | "muted" | "destructive"
> = {
  GO_IA: "success",
  POC_IA: "primary",
  AUTOMATION: "warning",
  STUDY: "muted",
  NO_GO: "destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status as ProjectStatus;
  return (
    <Badge variant={STATUS_VARIANTS[key] ?? "muted"}>
      {PROJECT_STATUS_LABELS[key] ?? status}
    </Badge>
  );
}

export function DecisionBadge({ decision }: { decision: string | null }) {
  if (!decision) {
    return <Badge variant="muted">En attente</Badge>;
  }
  const key = decision as Decision;
  return (
    <Badge variant={DECISION_VARIANTS[key] ?? "muted"}>
      {DECISION_LABELS[key] ?? decision}
    </Badge>
  );
}
