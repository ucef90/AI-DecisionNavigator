"use client";

import { useState, useTransition } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Bouton de suppression compact pour les cartes de la liste projets.
// Visible au survol, ouvre un mini-dialogue compact en place
// (pas un modal plein écran — l'utilisateur reste dans la liste).

type Props = {
  projectId: string;
  projectName: string;
  onConfirm: (formData: FormData) => Promise<void>;
};

export function ProjectCardDeleteButton({ projectId, projectName, onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, startTransition] = useTransition();
  const canDelete = typed === "DELETE";

  if (!open) {
    return (
      <button
        type="button"
        onClick={(e) => {
          // Empêche le clic de remonter à la Card (sinon nav vers projet)
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        title={`Supprimer "${projectName}"`}
        aria-label={`Supprimer le projet ${projectName}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      // Le mini-panel : surcouche sur la carte
      className="absolute inset-0 z-20 flex flex-col rounded-lg border border-destructive/40 bg-background p-3"
      onClick={(e) => e.preventDefault()}
    >
      <div className="mb-2 flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="flex-1">
          <div className="text-xs font-semibold text-destructive">Supprimer ce projet ?</div>
          <p className="text-[10px] text-muted-foreground">
            Action irréversible. Toutes les données du projet « {projectName} » seront perdues.
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setTyped("");
          }}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Annuler"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <Input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder="Tape DELETE pour confirmer"
        className={cn("text-xs", canDelete && "border-destructive bg-destructive/10")}
        onClick={(e) => e.preventDefault()}
        autoFocus
      />

      <div className="mt-auto flex gap-1.5 pt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            setTyped("");
          }}
          disabled={pending}
        >
          Annuler
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!canDelete || pending}
          className={cn(
            "flex-1 bg-destructive text-white hover:bg-destructive/90",
            !canDelete && "opacity-50",
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const form = new FormData();
            form.set("confirm", "DELETE");
            startTransition(() => onConfirm(form));
          }}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          {pending ? "…" : "Supprimer"}
        </Button>
      </div>

      <div className="mt-1 text-[9px] text-muted-foreground">
        ID : <code className="font-mono">{projectId}</code>
      </div>
    </div>
  );
}
