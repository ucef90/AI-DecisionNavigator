"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ScopeDefaults = {
  inScopeText: string;       // items joined by \n
  outOfScopeText: string;
  assumptionsForScope: string;
  scopeValidatedBy: string;
};

export function ScopeEditor({ defaults, action }: { defaults: ScopeDefaults; action: (formData: FormData) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <form action={(formData) => {
      startTransition(async () => {
        await action(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      });
    }} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            In scope (un item par ligne)
          </label>
          <Textarea name="inScope" rows={6} defaultValue={defaults.inScopeText} placeholder="Une ligne par item..." />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Hors scope (un item par ligne)
          </label>
          <Textarea name="outOfScope" rows={6} defaultValue={defaults.outOfScopeText} placeholder="Une ligne par item..." />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Hypothèses pour ce périmètre</label>
        <Textarea name="assumptionsForScope" rows={3} defaultValue={defaults.assumptionsForScope} />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Validé par (sponsor)</label>
        <Input name="scopeValidatedBy" defaultValue={defaults.scopeValidatedBy} placeholder="ex. Mme Dupont — 17/05/2026" />
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
        {saved ? <span className="text-xs text-emerald-700 dark:text-emerald-300">Sauvegardé.</span> : null}
        <Button type="submit" disabled={pending}>
          <Save className="mr-1.5 h-4 w-4" />
          {pending ? "..." : "Enregistrer le périmètre"}
        </Button>
      </div>
    </form>
  );
}
