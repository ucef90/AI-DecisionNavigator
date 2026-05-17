"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, BookOpenCheck, Compass, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Tour de bienvenue qui apparaît la 1re fois qu'un utilisateur ouvre
// un projet. État persisté dans localStorage (par projectId pour ne
// pas re-déclencher sur d'autres projets — et pouvoir le réinitialiser
// individuellement).
//
// 3 slides :
//   1. Vue d'ensemble : 7 ateliers
//   2. Logique consultant : pourquoi pas un formulaire
//   3. Comment l'app guide : signaux, gates, recos, exports

type Props = {
  projectId: string;
  projectName: string;
};

const STORAGE_KEY_PREFIX = "ai-nav.tour-dismissed.";

const SLIDES = [
  {
    icon: BookOpenCheck,
    title: "Bienvenue dans le cadrage IA",
    body: (
      <>
        <p className="text-sm">
          Cette application te guide à travers <strong>7 ateliers</strong> pour transformer
          une idée IA floue en décision argumentée.
        </p>
        <ol className="ml-5 mt-3 list-decimal space-y-1 text-sm">
          <li>Comprendre le vrai problème métier</li>
          <li>IA ou automatisation ?</li>
          <li>Questionnaire de cadrage IA</li>
          <li>Scoring et maturité projet</li>
          <li>Cartographie IA complète</li>
          <li>Gouvernance, risques, conformité</li>
          <li>Architecture cible, roadmap & décision finale</li>
        </ol>
        <p className="mt-3 text-xs text-muted-foreground">
          Chaque atelier produit ses livrables. Le 7<sup>e</sup> exporte un dossier markdown
          consolidé prêt pour COPIL.
        </p>
      </>
    ),
  },
  {
    icon: Compass,
    title: "Ce n'est pas un formulaire",
    body: (
      <>
        <p className="text-sm">
          L'app fonctionne comme un <strong>consultant senior</strong> qui t'accompagne :
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-1 text-sm">
          <li>Elle <strong>explique pourquoi</strong> chaque section existe.</li>
          <li>Elle <strong>détecte les pièges</strong> (ex. tu parles techno avant problème).</li>
          <li>Elle <strong>auto-calcule</strong> beaucoup de choses depuis ce que tu remplis.</li>
          <li>Elle propose des <strong>recommandations</strong> argumentées.</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Tu ne re-saisis jamais une donnée : les ateliers se nourrissent les uns des autres.
        </p>
      </>
    ),
  },
  {
    icon: Sparkles,
    title: "Comment naviguer",
    body: (
      <>
        <p className="text-sm">
          Sur chaque page tu trouves :
        </p>
        <ul className="ml-5 mt-3 list-disc space-y-1 text-sm">
          <li><strong>Nav gauche</strong> : les phases et sections de l'atelier en cours.</li>
          <li><strong>Workspace centre</strong> : pédagogie + édition guidée.</li>
          <li><strong>Panneau droit</strong> : signaux live + gate de passage à l'atelier suivant.</li>
        </ul>
        <p className="mt-3 text-sm">
          En haut de la page projet, une <strong>bannière "prochaine étape"</strong> te
          dit toujours où aller. Suis-la — elle se met à jour selon ton avancement.
        </p>
        <p className="mt-3 rounded-md bg-muted/40 px-3 py-2 text-xs italic text-muted-foreground">
          Tu peux réouvrir ce guide à tout moment via le bouton « ? » en haut de la page projet.
        </p>
      </>
    ),
  },
];

export function WelcomeTour({ projectId, projectName }: Props) {
  const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    // Affiche le tour si jamais dismissé pour ce projet
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(storageKey);
    if (!dismissed) setOpen(true);
  }, [storageKey]);

  const close = () => {
    setOpen(false);
    setSlide(0);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "1");
    }
  };

  // Bouton ré-ouverture (toujours visible)
  const reopen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    setSlide(0);
    setOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={reopen}
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-foreground/20 bg-background text-xs font-semibold text-muted-foreground hover:border-foreground/50 hover:text-foreground"
        title="Réouvrir le guide d'utilisation"
        aria-label="Réouvrir le guide d'utilisation"
      >
        ?
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-xl border border-border bg-background p-6 shadow-xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fermer le guide"
            >
              <X className="h-4 w-4" />
            </button>

            <SlideView slide={SLIDES[slide]} stepNumber={slide + 1} totalSteps={SLIDES.length} projectName={projectName} />

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex gap-1">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-6 rounded-full",
                      i === slide ? "bg-foreground" : i < slide ? "bg-foreground/40" : "bg-muted",
                    )}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {slide > 0 ? (
                  <Button variant="outline" size="sm" onClick={() => setSlide((s) => s - 1)}>
                    Précédent
                  </Button>
                ) : null}
                {slide < SLIDES.length - 1 ? (
                  <Button size="sm" onClick={() => setSlide((s) => s + 1)}>
                    Suivant
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={close}>
                    J&apos;ai compris, démarrer
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SlideView({
  slide,
  stepNumber,
  totalSteps,
  projectName,
}: {
  slide: typeof SLIDES[number];
  stepNumber: number;
  totalSteps: number;
  projectName: string;
}) {
  const Icon = slide.icon;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Guide d&apos;utilisation</span>
        <span>·</span>
        <span>{projectName}</span>
        <span className="ml-auto">{stepNumber} / {totalSteps}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-foreground/10 p-2 text-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">{slide.title}</h2>
      </div>
      <div className="text-foreground">{slide.body}</div>
    </div>
  );
}
