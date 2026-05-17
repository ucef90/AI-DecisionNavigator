"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Bouton de suppression projet avec :
//   1. clic initial → ouvre un mini-dialogue de confirmation
//   2. l'utilisateur DOIT taper "DELETE" pour activer le bouton
//   3. action serveur appelée (Prisma cascade supprime toutes les données)

type Props = {
  projectId: string;
  projectName: string;
  onConfirm: (formData: FormData) => Promise<void>;
};

export function DeleteProjectButton({ projectId, projectName, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-1.5 h-4 w-4" />
        Supprimer le projet
      </Button>
    );
  }

  const canDelete = typed === "DELETE";

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-destructive">Supprimer ce projet ?</h3>
            <p className="mt-1 text-xs text-foreground/80">
              Action irréversible. Toutes les données associées seront supprimées :
              ateliers 1-7 (acteurs, irritants, KPI, scorecard, RACI, roadmap, livrables…),
              cartographies, gates et toute la base de connaissance du projet{" "}
              <strong>« {projectName} »</strong>.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Tape <code className="rounded bg-foreground/10 px-1 py-0.5 text-[11px] font-mono">DELETE</code> ci-dessous pour confirmer.
            </p>
          </div>

          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Tape DELETE pour confirmer"
            className={cn(
              "max-w-xs",
              canDelete && "border-destructive bg-destructive/10",
            )}
            autoFocus
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setTyped("");
              }}
              disabled={pending}
            >
              Annuler
            </Button>
            <button
              type="button"
              disabled={!canDelete || pending}
              onClick={() => {
                const form = new FormData();
                form.set("confirm", "DELETE");
                startTransition(() => onConfirm(form));
              }}
              className={cn(
                buttonVariants(),
                "bg-destructive text-white hover:bg-destructive/90",
                !canDelete && "cursor-not-allowed opacity-50",
              )}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {pending ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </div>

          {/* Petit rappel utilisateur */}
          <p className="text-[10px] text-muted-foreground">
            ID projet : <code className="font-mono">{projectId}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
