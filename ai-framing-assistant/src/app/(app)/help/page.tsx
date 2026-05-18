import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  FileDown,
  HelpCircle,
  Layers,
  Lightbulb,
  ListChecks,
  Map,
  PlayCircle,
  Rocket,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { PrintPdfButton } from "@/components/help/print-pdf-button";
import { Badge } from "@/components/ui/badge";

// Manuel utilisateur — accessible via /help. Conçu pour quelqu'un qui
// découvre l'application et ne sait pas par où commencer. Print-ready :
// chaque grand chapitre force un saut de page (breakBefore: page).
export default function HelpPage() {
  return (
    <article className="deliverable-prose mx-auto max-w-4xl space-y-8 text-sm leading-relaxed">
      {/* Toolbar — masquée à l'impression */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
        <div>
          <h1 className="text-base font-semibold">Manuel utilisateur</h1>
          <p className="text-xs text-muted-foreground">
            Comprends l'application, sache par où commencer et où finir. Téléchargeable en PDF.
          </p>
        </div>
        <PrintPdfButton filename="ai-decision-navigator-manuel" />
      </div>

      {/* Couverture imprimable */}
      <div className="hidden print:block border-b border-foreground/30 pb-4">
        <div className="text-[10px] uppercase tracking-wider opacity-70">Manuel utilisateur</div>
        <h1 className="!mt-1 !mb-1 text-2xl font-bold">AI Decision Navigator</h1>
        <p className="!my-0 text-[11px] opacity-70">
          Le guide pratique pour cadrer un projet IA en 7 ateliers — sans se perdre.
        </p>
      </div>

      {/* ====================================================== */}
      {/* 1. À QUOI ÇA SERT */}
      {/* ====================================================== */}
      <Chapter
        icon={<Sparkles className="h-5 w-5" />}
        number="1"
        title="À quoi sert l'application ?"
      >
        <p>
          AI Decision Navigator est une <strong>méthode guidée</strong> pour cadrer un projet d'intelligence
          artificielle, du premier brief sponsor jusqu'à la décision finale (GO / POC / NO-GO).
        </p>
        <p>
          La méthode est éprouvée : <strong>7 ateliers de cadrage</strong>, dans un ordre logique, qui
          enchaînent <em>« comprendre le besoin métier → identifier ce que l'IA peut faire → cadrer
          techniquement → scorer → cartographier → gouverner → décider »</em>.
        </p>
        <p>
          À chaque atelier, l'application <strong>collecte des données</strong>, <strong>calcule des scores</strong>{" "}
          et <strong>te propose des recommandations</strong>. À la fin, tu disposes d'un{" "}
          <strong>dossier stratégique consolidé</strong> à présenter en COPIL, signer par ton sponsor et archiver.
        </p>

        <Callout tone="emerald" icon={<Lightbulb className="h-4 w-4" />} title="En une phrase">
          Tu remplis 7 ateliers à ton rythme, l'app calcule tout ce qui peut l'être, tu prends les décisions
          que toi seul peux prendre.
        </Callout>
      </Chapter>

      {/* ====================================================== */}
      {/* 2. EN 30 SECONDES */}
      {/* ====================================================== */}
      <Chapter
        icon={<PlayCircle className="h-5 w-5" />}
        number="2"
        title="En 30 secondes — où je commence ? où je finis ?"
        forceBreak
      >
        <Steps>
          <Step n={1} title="Commence ici" body={<>Ouvre <Code>/projects</Code> et clique <strong>« Nouveau projet »</strong>. Donne-lui un nom et un sponsor.</>} />
          <Step n={2} title="Suis la bannière" body={<>La page projet affiche en haut une <strong>bannière « Continue ici »</strong> qui te dit exactement quelle section remplir maintenant.</>} />
          <Step n={3} title="Remplis Atelier 1 d'abord" body={<>Atelier 1 = « Compréhension du besoin métier ». C'est <strong>OBLIGATOIRE</strong> avant les autres car les ateliers suivants en dépendent.</>} />
          <Step n={4} title="Valide les gates" body={<>À la fin de chaque atelier, une page <strong>« Gate »</strong> vérifie que tu as bien tout rempli. Quand le verdict est <Badge variant="outline">READY</Badge>, tu passes au suivant.</>} />
          <Step n={5} title="Tu as fini quand…" body={<>L'atelier 7 produit le <strong>dossier stratégique final</strong>. Tu cliques <em>Télécharger PDF</em> sur la page livrable. C'est fini.</>} />
        </Steps>

        <Callout tone="sky" icon={<Compass className="h-4 w-4" />} title="Tu ne sais jamais où aller">
          Sur la page d'un projet, regarde la <strong>bannière colorée en haut</strong>. Elle te dit
          toujours la prochaine étape recommandée — bouton bleu en haut à droite. Suis-la.
        </Callout>
      </Chapter>

      {/* ====================================================== */}
      {/* 3. L'INTERFACE */}
      {/* ====================================================== */}
      <Chapter
        icon={<Map className="h-5 w-5" />}
        number="3"
        title="Comprendre l'interface"
        forceBreak
      >
        <Subtitle>Le sidebar (menu de gauche)</Subtitle>
        <UList>
          <li><strong>Dashboard</strong> — vue d'ensemble : tes projets, leur avancement, les décisions IA.</li>
          <li><strong>Projets</strong> — la liste de tous tes projets. Bouton suppression sur chaque carte.</li>
          <li><strong>Nouveau projet</strong> — formulaire de création (nom, sponsor, déclencheur).</li>
          <li><strong>Manuel</strong> — cette page.</li>
        </UList>

        <Subtitle>La page d'un projet</Subtitle>
        <UList>
          <li>En haut : la <strong>bannière prochaine étape</strong> (le compas de l'app).</li>
          <li>Au milieu : les <strong>7 cartes ateliers</strong> avec leur état (vide / en cours / complet).</li>
          <li>Sur chaque atelier : une liste de <strong>sections</strong> à remplir (entre 5 et 12 par atelier, regroupées en 5 phases A → E).</li>
        </UList>

        <Subtitle>Une section d'atelier</Subtitle>
        <UList>
          <li><strong>Phase X — Titre</strong> en haut (ex. « Phase A — Contexte »).</li>
          <li>Deux cartes pédagogiques colorées : <em>« Pourquoi cette section ? »</em> et <em>« Ce qu'on cherche »</em>. Lis-les.</li>
          <li>Une zone d'édition (formulaire ou liste). C'est <strong>là que tu travailles</strong>.</li>
          <li>Sur chaque champ : un petit <strong>(i)</strong> au survol — la bulle d'aide explique ce qu'on attend.</li>
        </UList>

        <Callout tone="amber" icon={<HelpCircle className="h-4 w-4" />} title="Le petit (i) est ton meilleur ami">
          Survole-le sur n'importe quel champ : tu obtiens une phrase concise expliquant le format attendu,
          les valeurs typiques et les pièges à éviter.
        </Callout>
      </Chapter>

      {/* ====================================================== */}
      {/* 4. LES 7 ATELIERS */}
      {/* ====================================================== */}
      <Chapter
        icon={<Layers className="h-5 w-5" />}
        number="4"
        title="Les 7 ateliers, un par un"
        forceBreak
      >
        <p className="mb-4 text-muted-foreground">
          Chaque atelier répond à <em>une</em> question stratégique. Voici ce que tu fais et ce que tu produis.
        </p>

        <AtelierCard
          n={1}
          title="Compréhension du besoin métier"
          question="C'est quoi le vrai problème métier ?"
          tu_remplis={[
            "La fiche de qualification (sponsor, direction, contexte)",
            "Le besoin reformulé SANS techno",
            "Les acteurs impactés, leurs douleurs, leurs gains attendus",
            "Le workflow AS-IS (étapes actuelles)",
            "Les irritants chiffrés (« 40% du temps perdu à... »)",
            "Les KPI baseline (valeur actuelle + cible)",
            "Le périmètre (in / out)",
          ]}
          tu_obtiens="Un document COPIL qui prouve que tu as compris le problème — avant même de parler IA."
          mainAction={{ label: "Démarrer atelier 1", color: "amber" }}
        />

        <AtelierCard
          n={2}
          title="IA vs automatisation"
          question="L'IA est-elle pertinente, ou une simple automatisation suffit ?"
          tu_remplis={[
            "La qualification de chaque tâche : IA / AUTOMATION / HUMAN / HYBRID",
            "Le niveau de complexité par étape",
            "Les besoins en intelligence (NLP, OCR, RAG, classification…)",
            "Les candidats technologiques",
            "Les points de validation humaine bloquante",
          ]}
          tu_obtiens="Un profil projet : AI_FULL, AI_HYBRID, AUTOMATION, ou NO_IA — qui oriente toute la suite."
        />

        <AtelierCard
          n={3}
          title="Cadrage IA"
          question="Le projet est-il faisable, légalement et techniquement ?"
          tu_remplis={[
            "L'analyse documentaire (formats, OCR, NLP, RAG)",
            "Le cadre réglementaire (RGPD, EU AI Act, DPO)",
            "L'auto-évaluation de maturité (6 axes 1-5)",
            "L'évaluation de faisabilité (technique, organisationnelle, données…)",
          ]}
          tu_obtiens="Une synthèse 'maturité + complexité + risques principaux + recommandation' pour préparer le scoring."
        />

        <AtelierCard
          n={4}
          title="Scoring & maturité"
          question="Quelle est la qualité globale du projet, et que recommander ?"
          tu_remplis={[
            "Les 11 axes du scoring (auto-calculés, tu peux surcharger avec justification)",
            "La priorité du projet (LOW / MEDIUM / HIGH)",
            "La décision recommandée + son rationnel",
          ]}
          tu_obtiens="Un radar SVG des 11 axes + un score /100 + une décision argumentée (GO_IA / POC_IA / AUTOMATION / STUDY / NO_GO)."
        />

        <AtelierCard
          n={5}
          title="Cartographie IA"
          question="Tout est-il cohérent à travers les 6 couches du système ?"
          tu_remplis={[
            "Des annotations sur la cartographie (warnings, décisions, notes)",
            "Les nœuds critiques",
            "La synthèse système",
          ]}
          tu_obtiens="Une vue 360° du système (métier, workflow, data, techno, risques, gouvernance) — pour détecter les angles morts."
        />

        <AtelierCard
          n={6}
          title="Gouvernance, risques, conformité"
          question="Le projet peut-il être industrialisé sans risque ?"
          tu_remplis={[
            "La matrice RACI (R/A/C/I par scope)",
            "Les points de validation humaine",
            "Les risques IA scorés (hallucination, biais, sécurité…)",
            "Les contrôles sécurité (AUTH, RBAC, chiffrement, logs…)",
            "La checklist conformité (RGPD, EU AI Act, ISO…)",
            "Les KPI à monitorer + playbook incidents",
          ]}
          tu_obtiens="Un score gouvernance /100 + un verdict « industrialisation envisageable » ou non."
        />

        <AtelierCard
          n={7}
          title="Architecture cible, roadmap, décision finale"
          question="On fait quoi, dans quel ordre, et qui signe ?"
          tu_remplis={[
            "La vision stratégique et la valeur business chiffrée",
            "La roadmap (Gantt) : POC → MVP → Pilote → Rollout → Run",
            "Le plan d'industrialisation par paliers",
            "La décision finale (avec rationnel) + signature sponsor",
          ]}
          tu_obtiens="Le DOSSIER STRATÉGIQUE FINAL téléchargeable en PDF unique : couverture, radar, RACI, Gantt, jauges + texte complet."
          mainAction={{ label: "Dossier final", color: "emerald" }}
        />
      </Chapter>

      {/* ====================================================== */}
      {/* 5. LES OUTILS TRANSVERSES */}
      {/* ====================================================== */}
      <Chapter
        icon={<ListChecks className="h-5 w-5" />}
        number="5"
        title="Les outils qui reviennent partout"
        forceBreak
      >
        <Subtitle>La bannière « Prochaine étape »</Subtitle>
        <p>
          Sur chaque page projet. C'est le <strong>compas</strong> de l'app. Elle a 4 modes :
        </p>
        <UList>
          <li><Badge variant="outline">DISCOVER</Badge> — démarrer ici (projet vierge).</li>
          <li><Badge variant="outline">CONTINUE</Badge> — continue où tu en étais.</li>
          <li><Badge variant="outline">GATE</Badge> — un gate t'attend pour valider l'atelier.</li>
          <li><Badge variant="outline">DONE</Badge> — framework complet, tu peux exporter.</li>
        </UList>

        <Subtitle>Le ScoreInput (1-5)</Subtitle>
        <p>
          Cinq pastilles cliquables. Au survol de chaque pastille, une <strong>description contextuelle</strong>{" "}
          du niveau apparaît (ex. pour <em>« Qualité données »</em>, niveau 3 = « sources documentées, accès organisés »).
          Mode <Badge variant="outline">Auto</Badge> = score calculé par le moteur ; mode <Badge variant="outline">Manuel</Badge> = override avec justification.
        </p>

        <Subtitle>Les gates</Subtitle>
        <p>
          Page de fin d'atelier qui liste les critères de réussite. Verdicts possibles :{" "}
          <Badge variant="outline" className="border-emerald-500/40">READY</Badge> (tout est OK),{" "}
          <Badge variant="outline" className="border-amber-500/40">NOT_READY</Badge> (il manque des choses),{" "}
          <Badge variant="outline" className="border-violet-500/40">OVERRIDE</Badge> (tu valides malgré un manque, avec justification).
        </p>

        <Subtitle>Les bulles d'aide « (i) »</Subtitle>
        <p>
          À côté de quasiment chaque label de champ. Au survol / focus clavier, une phrase t'explique ce
          qu'on attend dans ce champ — format, exemple, piège.
        </p>

        <Subtitle>Le dossier consolidé</Subtitle>
        <p>
          Disponible dans <Code>/atelier/7/deliverable</Code>. Trois actions :
        </p>
        <UList>
          <li><strong>Copier</strong> — le markdown dans le presse-papiers.</li>
          <li><strong>.md</strong> — téléchargement texte (Notion, Confluence…).</li>
          <li><strong>Télécharger PDF</strong> — un seul PDF complet, avec toutes les visualisations.</li>
        </UList>
      </Chapter>

      {/* ====================================================== */}
      {/* 6. QUAND EST-CE QUE C'EST FINI ? */}
      {/* ====================================================== */}
      <Chapter
        icon={<Trophy className="h-5 w-5" />}
        number="6"
        title="Quand est-ce que c'est fini ?"
        forceBreak
      >
        <p>
          C'est fini quand <strong>les 4 conditions suivantes</strong> sont réunies :
        </p>
        <Steps>
          <Step n={1} title="Les 7 gates sont validés" body={<>Chaque atelier a son gate (READY ou OVERRIDE). Tu les vois sur la page du projet.</>} />
          <Step n={2} title="La décision finale est prise" body={<>Sur la page <Code>/atelier/7/final-decision</Code>, le champ « Décision » contient GO_IA, POC_IA, AUTOMATION, STUDY ou NO_GO.</>} />
          <Step n={3} title="Le sponsor a signé" body={<>Toujours sur la même page, le champ « Décision sponsor » est OK avec nom + date.</>} />
          <Step n={4} title="Le dossier est exporté" body={<>Tu as téléchargé le PDF final. Tu peux le présenter au COPIL.</>} />
        </Steps>

        <Callout tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />} title="Bonus">
          Tu peux toujours revenir éditer une section après coup — les scores et la synthèse se mettent à
          jour automatiquement. L'export PDF reflète l'état le plus récent.
        </Callout>
      </Chapter>

      {/* ====================================================== */}
      {/* 7. FAQ */}
      {/* ====================================================== */}
      <Chapter
        icon={<HelpCircle className="h-5 w-5" />}
        number="7"
        title="FAQ — les questions qu'on se pose à l'usage"
        forceBreak
      >
        <Faq q="Je dois remplir TOUS les champs ?">
          Non. Remplis ce que tu sais. Les champs vides apparaissent comme « (non renseigné) » dans le
          livrable et les gates indiquent ce qui bloque. Tu peux y revenir plus tard.
        </Faq>
        <Faq q="Je n'ai pas toutes les infos pour l'atelier 3, je peux passer à l'atelier 4 ?">
          Techniquement oui, mais l'atelier 4 (scoring) re-calcule depuis les données 1+2+3. Si elles
          sont vides, le score sera bas et la décision peu fiable. Garde un atelier <em>complet à 60%</em>{" "}
          plutôt qu'un atelier <em>vide à 100%</em>.
        </Faq>
        <Faq q="Le moteur me dit POC_IA mais je veux GO_IA, je peux ?">
          Oui — sur la page <em>« Décision finale »</em> tu peux choisir manuellement et justifier ton
          choix dans le rationnel. Tu auras un override que le sponsor verra.
        </Faq>
        <Faq q="Comment je supprime un projet ?">
          Sur la liste des projets (<Code>/projects</Code>), bouton corbeille sur chaque carte. Demande
          confirmation. Action irréversible (la base supprime aussi toutes les données ateliers liées).
        </Faq>
        <Faq q="Je suis bloqué sur un gate, comment je débloque ?">
          Le gate liste les critères non remplis. Clique sur la ligne du critère pour aller à la section
          correspondante. Une fois remplie, reviens — le gate se met à jour automatiquement.
        </Faq>
        <Faq q="Je peux travailler à plusieurs ?">
          Pas encore : un projet = un compte. Tu peux copier-coller le PDF / markdown pour partager.
        </Faq>
        <Faq q="Mes données sont stockées où ?">
          Localement dans une base SQLite (<Code>prisma/dev.db</Code>) en environnement de dev. En
          production : base PostgreSQL. Rien n'est envoyé à un service externe sans ton accord (les
          appels LLM sont optionnels et configurés dans Paramètres).
        </Faq>
      </Chapter>

      {/* ====================================================== */}
      {/* 8. CHEAT-SHEET */}
      {/* ====================================================== */}
      <Chapter
        icon={<Rocket className="h-5 w-5" />}
        number="8"
        title="Cheat-sheet — les liens utiles"
        forceBreak
      >
        <UList>
          <li><strong>Liste des projets</strong> — <Code>/projects</Code></li>
          <li><strong>Créer un projet</strong> — <Code>/projects/new</Code></li>
          <li><strong>Page projet</strong> — <Code>/projects/[id]</Code></li>
          <li><strong>Atelier 1 (besoin métier)</strong> — <Code>/projects/[id]/atelier/1</Code></li>
          <li><strong>Atelier 4 (scoring)</strong> — <Code>/projects/[id]/atelier/4/cockpit</Code></li>
          <li><strong>Atelier 7 (décision finale)</strong> — <Code>/projects/[id]/atelier/7/final-decision</Code></li>
          <li><strong>Livrable PDF</strong> — <Code>/projects/[id]/atelier/7/deliverable</Code></li>
          <li><strong>Manuel (cette page)</strong> — <Code>/help</Code></li>
          <li><strong>Paramètres</strong> — <Code>/settings</Code></li>
        </UList>

        <Callout tone="sky" icon={<Target className="h-4 w-4" />} title="La règle d'or">
          Si tu hésites, suis la <strong>bannière « Prochaine étape »</strong>. Elle ne se trompe jamais
          sur ce qu'il y a à faire ensuite.
        </Callout>

        <p className="print:hidden mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
          >
            <Sparkles className="h-4 w-4" />
            Démarrer un nouveau projet
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/projects/demo-mailbox"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <PlayCircle className="h-4 w-4" />
            Voir le projet vitrine rempli
          </Link>
        </p>
      </Chapter>
    </article>
  );
}

// ====================================================================
// Composants présentationnels — locaux à la page d'aide
// ====================================================================

const PAGE_BREAK: React.CSSProperties = { breakBefore: "page", pageBreakBefore: "always" };

function Chapter({
  number,
  title,
  icon,
  children,
  forceBreak,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  forceBreak?: boolean;
}) {
  return (
    <section style={forceBreak ? PAGE_BREAK : undefined} className="space-y-3 break-inside-avoid">
      <header className="flex items-center gap-3 border-b border-foreground/20 pb-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-foreground">
          {icon}
        </span>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Chapitre {number}
          </div>
          <h2 className="!my-0 text-xl font-semibold">{title}</h2>
        </div>
      </header>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="!mt-4 !mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

function UList({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1">{children}</ul>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono">{children}</code>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="space-y-2">{children}</ol>;
}

function Step({ n, title, body }: { n: number; title: string; body: React.ReactNode }) {
  return (
    <li className="flex gap-3 rounded-md border border-border bg-muted/30 p-3 print:bg-transparent">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold">
        {n}
      </span>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{body}</div>
      </div>
    </li>
  );
}

const CALLOUT_TONES = {
  amber: "border-amber-500/40 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100",
  sky: "border-sky-500/40 bg-sky-50/70 text-sky-950 dark:bg-sky-950/30 dark:text-sky-100",
  emerald: "border-emerald-500/40 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100",
  rose: "border-rose-500/40 bg-rose-50/70 text-rose-950 dark:bg-rose-950/30 dark:text-rose-100",
} as const;

function Callout({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof CALLOUT_TONES;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={`rounded-md border-l-4 px-4 py-3 ${CALLOUT_TONES[tone]}`}>
      <header className="mb-1 flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </header>
      <div className="text-sm leading-snug">{children}</div>
    </aside>
  );
}

function AtelierCard({
  n,
  title,
  question,
  tu_remplis,
  tu_obtiens,
  mainAction,
}: {
  n: number;
  title: string;
  question: string;
  tu_remplis: string[];
  tu_obtiens: string;
  mainAction?: { label: string; color: "amber" | "emerald" | "sky" };
}) {
  return (
    <section className="break-inside-avoid rounded-lg border border-border bg-background p-4 shadow-sm print:shadow-none">
      <header className="mb-2 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background text-sm font-semibold">
          {n}
        </span>
        <div className="flex-1">
          <h3 className="!my-0 text-base font-semibold">Atelier {n} — {title}</h3>
          <p className="!my-0 text-xs italic text-muted-foreground">« {question} »</p>
        </div>
        {mainAction ? (
          <Badge variant="outline" className="text-[10px]">
            {mainAction.label}
          </Badge>
        ) : null}
      </header>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ce que tu remplis
          </div>
          <ul className="mt-1 ml-4 list-disc space-y-0.5 text-xs">
            {tu_remplis.map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Ce que tu obtiens
          </div>
          <p className="mt-1 text-xs">{tu_obtiens}</p>
        </div>
      </div>
    </section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="break-inside-avoid rounded-md border border-border bg-background p-3">
      <div className="mb-1 flex items-start gap-2 text-sm font-semibold">
        <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {q}
      </div>
      <div className="ml-5 text-xs text-muted-foreground">{children}</div>
    </div>
  );
}

// Pour éviter warning unused-imports
void AlertTriangle;
void FileDown;
