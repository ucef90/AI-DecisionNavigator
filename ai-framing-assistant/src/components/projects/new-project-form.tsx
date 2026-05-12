"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { FieldHint } from "@/components/ui/field-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProject,
  type ActionState,
} from "@/lib/actions/projects";
import { MATURITY_LABELS, MATURITY_LEVELS } from "@/types";

const initialState: ActionState = {};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) return null;
  return <p className="text-xs text-destructive">{messages.join(" — ")}</p>;
}

// Label + info icon, side by side.
function FieldLabel({
  htmlFor,
  required,
  hint,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  hint: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={htmlFor}>
        {children}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      <FieldHint>{hint}</FieldHint>
    </div>
  );
}

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {state?.error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/80">
          Identité du projet
        </h3>

        <div className="space-y-1.5">
          <FieldLabel
            htmlFor="name"
            required
            hint="Nom court et explicite. Évite les acronymes internes. Ex : « Automatisation du tri courrier MDPH » plutôt que « Projet TCM-V2 »."
          >
            Nom du projet
          </FieldLabel>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            placeholder="Ex. : Automatisation des boîtes mails"
          />
          <FieldError messages={fe.name} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="direction"
              hint="Direction porteuse du projet (DSI, Direction des Solidarités, Direction métier…). Sert au reporting et au filtrage des projets dans le dashboard."
            >
              Direction
            </FieldLabel>
            <Input
              id="direction"
              name="direction"
              maxLength={120}
              placeholder="Ex. : Direction des Solidarités"
            />
            <FieldError messages={fe.direction} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="sponsor"
              hint="Décideur exécutif qui porte le projet politiquement et budgétairement. Doit pouvoir arbitrer les choix et lever les blocages organisationnels."
            >
              Sponsor
            </FieldLabel>
            <Input
              id="sponsor"
              name="sponsor"
              maxLength={120}
              placeholder="Nom du sponsor exécutif"
            />
            <FieldError messages={fe.sponsor} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="managerName"
              hint="Personne en charge opérationnelle du cadrage. Animera les ateliers, fera le lien entre métier / DSI / data, et suivra l'avancement avec le sponsor."
            >
              Chef de projet
            </FieldLabel>
            <Input
              id="managerName"
              name="managerName"
              maxLength={120}
              placeholder="Nom du chef de projet"
            />
            <FieldError messages={fe.managerName} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="maturity"
              hint="Maturité IA de l'organisation. Faible = première initiative IA, pas de gouvernance dédiée. Moyenne = quelques pilotes ou POC. Élevée = plusieurs projets IA en production avec processus établis."
            >
              Maturité estimée
            </FieldLabel>
            <select
              id="maturity"
              name="maturity"
              defaultValue=""
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            >
              <option value="">— Non renseignée —</option>
              {MATURITY_LEVELS.map((m) => (
                <option key={m} value={m}>
                  {MATURITY_LABELS[m]}
                </option>
              ))}
            </select>
            <FieldError messages={fe.maturity} />
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel
            htmlFor="description"
            hint="1 à 2 phrases qui résument le projet pour les listings et rapports. C'est l'accroche, pas le détail technique — celui-ci sera saisi dans les étapes suivantes."
          >
            Description courte
          </FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={2}
            maxLength={2000}
            placeholder="Synthèse en 1-2 phrases qui apparaîtra dans les listes."
          />
          <FieldError messages={fe.description} />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground/80">
          Contexte métier{" "}
          <span className="font-normal text-muted-foreground">
            (sera reformulé par l&apos;assistant IA à l&apos;étape 2)
          </span>
        </h3>

        <div className="space-y-1.5">
          <FieldLabel
            htmlFor="initialRequest"
            hint="La demande EXACTEMENT comme elle a été formulée par le métier (mail, courrier, compte-rendu d'atelier…). Ne la reformule pas — l'assistant IA s'en chargera à l'étape 2 pour identifier le vrai besoin sous-jacent."
          >
            Demande initiale
          </FieldLabel>
          <Textarea
            id="initialRequest"
            name="initialRequest"
            rows={4}
            maxLength={4000}
            placeholder="Décris la demande telle qu'elle a été exprimée, avec ses mots."
          />
          <FieldError messages={fe.initialRequest} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="expectedValue"
              hint="Valeur métier ciblée : gain de temps (en jours/an), qualité (taux d'erreur, délai de traitement), conformité réglementaire, expérience usager… À chiffrer dès que possible — un objectif quantifiable facilite la décision GO/NO GO."
            >
              Objectif attendu
            </FieldLabel>
            <Textarea
              id="expectedValue"
              name="expectedValue"
              rows={3}
              maxLength={2000}
              placeholder="Quel résultat est attendu ? Gain de temps, qualité, conformité…"
            />
            <FieldError messages={fe.expectedValue} />
          </div>
          <div className="space-y-1.5">
            <FieldLabel
              htmlFor="usersImpacted"
              hint="Qui utilisera la solution au quotidien ? Agents internes, encadrement, usagers externes, partenaires ? Estime le volume (~50 agents, ~10 000 usagers/an…) — c'est un facteur clé pour l'analyse de risques et d'adoption."
            >
              Utilisateurs concernés
            </FieldLabel>
            <Textarea
              id="usersImpacted"
              name="usersImpacted"
              rows={3}
              maxLength={2000}
              placeholder="Agents, encadrement, usagers, partenaires externes…"
            />
            <FieldError messages={fe.usersImpacted} />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Link href="/projects" className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Création..." : "Créer le projet"}
        </Button>
      </div>
    </form>
  );
}
