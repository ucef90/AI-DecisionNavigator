"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit3, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Patron générique pour une "section liste" éditable :
//   - bandeau "+ Ajouter" qui révèle un formulaire de création
//   - rendu de chaque item via `renderItem` (custom par section)
//   - mode édition inline avec `renderForm` (custom par section)
//   - suppression avec confirmation simple (clic 2 fois)
//
// Les actions create/update/delete sont des server actions
// passées en props.

export type EditableListProps<T extends { id: string }> = {
  items: T[];
  emptyMessage: string;
  addLabel?: string;
  renderItem: (item: T, editing: { startEdit: () => void; askDelete: () => void; isDeleting: boolean }) => React.ReactNode;
  renderForm: (item: T | null, props: { formAction: (formData: FormData) => void; cancel: () => void; pending: boolean }) => React.ReactNode;
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function EditableList<T extends { id: string }>({
  items,
  emptyMessage,
  addLabel = "Ajouter",
  renderItem,
  renderForm,
  onCreate,
  onUpdate,
  onDelete,
}: EditableListProps<T>) {
  const [editing, setEditing] = useState<{ id: string | "NEW" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      await onCreate(formData);
      setEditing(null);
    });
  };

  const handleUpdate = (id: string) => (formData: FormData) => {
    startTransition(async () => {
      await onUpdate(id, formData);
      setEditing(null);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await onDelete(id);
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm italic text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isEditingThis = editing?.id === item.id;
            if (isEditingThis) {
              return (
                <div key={item.id} className="rounded-md border border-foreground/30 bg-background p-3">
                  {renderForm(item, { formAction: handleUpdate(item.id), cancel: () => setEditing(null), pending })}
                </div>
              );
            }
            return (
              <div key={item.id} className="group relative">
                {renderItem(item, {
                  startEdit: () => setEditing({ id: item.id }),
                  askDelete: () => setDeletingId(item.id),
                  isDeleting: deletingId === item.id,
                })}
                {/* Actions overlay */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setEditing({ id: item.id })}
                    className="rounded-md border border-border bg-background p-1 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    title="Éditer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  {deletingId === item.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={pending}
                        className="rounded-md border border-destructive/40 bg-destructive/10 p-1 text-destructive hover:bg-destructive/20"
                        title="Confirmer suppression"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="rounded-md border border-border bg-background p-1 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                        title="Annuler"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="rounded-md border border-border bg-background p-1 text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing?.id === "NEW" ? (
        <div className="rounded-md border border-foreground/30 bg-background p-3">
          {renderForm(null, { formAction: handleCreate, cancel: () => setEditing(null), pending })}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing({ id: "NEW" })}
          className={cn(editing && "hidden")}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Composant utilitaire — boutons OK/Annuler dans les formulaires
// inline (à passer en children du form de chaque section).
// -------------------------------------------------------------
export function EditFormFooter({ cancel, pending, saveLabel = "Enregistrer" }: { cancel: () => void; pending: boolean; saveLabel?: string }) {
  return (
    <div className="mt-3 flex justify-end gap-2 border-t border-border pt-2">
      <Button type="button" size="sm" variant="outline" onClick={cancel} disabled={pending}>
        Annuler
      </Button>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : saveLabel}
      </Button>
    </div>
  );
}
