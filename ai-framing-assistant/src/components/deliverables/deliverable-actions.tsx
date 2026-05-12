"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCcw, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteDeliverable,
  generateAllDeliverablesAction,
  generateOneDeliverable,
} from "@/lib/actions/deliverables";

// Small client wrapper around the three deliverable actions. Server actions
// must be invoked from a client boundary when we want to show pending state.

export function GenerateAllButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await generateAllDeliverablesAction(projectId);
          router.refresh();
        })
      }
    >
      <Sparkles className="mr-2 size-4" />
      {pending ? "Génération en cours…" : "Générer tous les livrables"}
    </Button>
  );
}

export function RegenerateOneButton({
  projectId,
  type,
  label,
  variant = "outline",
}: {
  projectId: string;
  type: string;
  label: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await generateOneDeliverable(projectId, type);
          router.refresh();
        })
      }
    >
      <RefreshCcw className={`mr-1.5 size-3.5 ${pending ? "animate-spin" : ""}`} />
      {pending ? "…" : label}
    </Button>
  );
}

export function DeleteDeliverableButton({
  projectId,
  type,
}: {
  projectId: string;
  type: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await deleteDeliverable(projectId, type);
          router.refresh();
        })
      }
      aria-label="Supprimer"
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
