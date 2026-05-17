# Guide utilisateur — AI Decision Navigator

Ce guide explique **comment utiliser** la plateforme (parcours, boutons, livrables) et **comment elle fonctionne sous le capot** (engines, données, décisions). Lecture en ~15 minutes.

---

## 1. À quoi sert l'app

AI Decision Navigator est une plateforme de **cadrage et décision IA**. Elle transforme une idée IA floue en :

- **analyse structurée** (besoin, données, risques, gouvernance)
- **scoring** sur 6 axes (1 à 3 chacun, total /18)
- **décision argumentée** : `GO_IA`, `POC_IA`, `AUTOMATION`, `STUDY` ou `NO_GO`
- **cartographie** en 6 vues systémiques
- **plan d'action** ordonné avec pilotes et horizons
- **7 livrables** prêts à exporter (markdown / PDF par impression)

Elle reproduit la logique d'un atelier de cadrage IA : reformulation du besoin, challenge des hypothèses, détection des signaux de maturité, application de règles de gouvernance — sans se limiter à une note automatique.

---

## 2. Démarrage rapide

### 2.1. Mode dev local (SQLite, zero-setup)

```bash
cd ai-framing-assistant
npm install
npx prisma generate                    # 1re fois ou après pull
npx prisma migrate deploy              # applique les migrations SQLite
npm run seed                           # 3 projets démo SPEC (optionnel)
npm run dev                            # http://localhost:3000 (ou 3001 si pris)
```

Pas besoin de Postgres, pas de Docker. La base SQLite est à `ai-framing-assistant/dev.db`.

### 2.2. Mode Docker (PostgreSQL, on-premise)

```bash
cd ai-framing-assistant
cp .env.example .env                   # éditer si besoin
docker compose up --build              # build + start
```

Détails dans [`ai-framing-assistant/DEPLOY.md`](ai-framing-assistant/DEPLOY.md).

### 2.3. Vérifier que les engines fonctionnent

```bash
cd ai-framing-assistant
npx tsx prisma/verify-engines.ts        # vérifie les décisions des 3 cas SPEC
npx tsx prisma/verify-deliverables.ts   # vérifie la génération des 7 livrables
```

Sortie attendue de `verify-engines.ts` :

```
✓ Boîtes mails           → GO_IA       (score 18/18)
✓ Interprétariat PMI     → NO_GO       (score 15/18, overridden par R1 RGPD)
✓ LAD MDPH               → POC_IA      (score 18/18, overridden par R6 données sensibles)
→ Tous les cas SPEC sont conformes.
```

---

## 3. Parcours utilisateur étape par étape

```
Nouveau projet → Wizard (5 étapes) → Scoring → Décision → Cartographie → Livrables
   /projects/new       /wizard/*       /scoring   /decision    /cartography      /deliverables
```

### Étape 0 — Dashboard et liste

- **`/dashboard`** : vue d'ensemble des projets, KPIs portfolio
- **`/projects`** : liste, filtres, statut et décision badges
- **`/projects/new`** : création d'un projet avec nom, direction, sponsor, demande initiale

### Étape 1-5 — Wizard de cadrage (`/projects/[id]/wizard/...`)

Cinq blocs guidés, chacun avec sa propre page :

| Étape | URL | Ce qu'on capture |
|---|---|---|
| 1. Besoin métier | `/wizard/business-need` | Reformulation, irritants, KPIs actuels, utilisateurs impactés, résultat attendu |
| 2. IA ou pas IA | `/wizard/ai-analysis` | 8 approches envisageables (automation, ML, LLM, RAG, agent…) + recommandation + justification |
| 3. Données | `/wizard/data` | Sources, structurées/non, qualité, accessibilité, sensibilité, RGPD |
| 4. Architecture | `/wizard/architecture` | Applications, APIs, workflow actuel vs cible, validation humaine, traçabilité |
| 5. Risques | `/wizard/risks` | 10 axes de risque notés 1-5 (RGPD, hallucinations, biais, sécurité, adoption…) + plan de mitigation |

À chaque étape : autosave dans Prisma, possibilité de quitter et reprendre. Le stepper affiche la progression. Une fois les 5 étapes faites, on bascule en phase **engine** (scoring → décision → cartographie → livrables).

### Étape 6 — Scoring (`/projects/[id]/scoring`)

Le moteur calcule automatiquement **6 axes** notés de 1 à 3 :

1. **Clarté du besoin**
2. **Pertinence IA**
3. **Maturité data**
4. **Valeur métier**
5. **Risques maîtrisables**
6. **Faisabilité technique**

→ **Total /18** avec lecture interprétée (SPEC §177) :
- 15-18 : GO IA ou POC rapide
- 10-14 : POC / étude complémentaire
- 6-9 : projet IA peu mature
- <6 : NO GO IA / automatisation simple

L'utilisateur peut **surcharger** chaque axe avant validation. Persiste dans la table `Scoring`. Status projet passe de `IN_PROGRESS` à `SCORED`.

La page affiche aussi les **signaux moteur** détectés (formulation orientée solution, RGPD non documenté, etc.) et la **confiance globale** (LOW/MEDIUM/HIGH) basée sur la complétude des réponses.

### Étape 7 — Décision (`/projects/[id]/decision`)

Le moteur de décision applique **6 règles métier** qui peuvent **abaisser** le verdict brut du scoring :

| Règle | Condition | Effet |
|---|---|---|
| R1 | Données sensibles + risque RGPD ≥ 4 + pas de plan | **NO_GO** |
| R2 | Risque global = CRITICAL | Cap à **POC_IA** |
| R3 | Aucune source de données identifiée | Cap à **STUDY** |
| R4 | Seules approches non-IA cochées | **AUTOMATION** |
| R5 | Clarté besoin = 1 ET maturité data = 1 | Cap à **STUDY** |
| R6 | Données sensibles (santé, judiciaire) | Cap à **POC_IA** |

Affichage :
- **Décision finale** avec badge coloré (GO / POC / AUTO / STUDY / NO GO)
- **Bloquants** à lever (en rouge)
- **Justification structurée** : forces, faiblesses, règles déclenchées
- **Plan d'action** ordonné avec pilote (rôle), catégorie, horizon

L'utilisateur peut **finaliser** la décision (set `Project.finalDecision`, status `DECIDED`) ou la surcharger avec une justification additionnelle.

### Étape 8 — Cartographie (`/projects/[id]/cartography`)

**6 vues systémiques**, onglets en haut :

1. **Métier** — besoin reformulé, valeur attendue, objectifs, KPIs, impact utilisateurs, irritants
2. **Workflow** — pipeline actuel (manuel, en rouge) vs cible (étapes IA en vert, validations humaines en jaune)
3. **Données** — sources → plateforme IA → usages, avec icônes par type, sensibilité, RGPD
4. **Acteurs** — hub central + 5-6 rôles autour (usager, agent, manager, gouvernance, IT, superviseur)
5. **Technologie** — architecture en couches (Interfaces / Couche IA / Intégration / Systèmes externes) + colonne sécurité-gouvernance
6. **Risques** — grille 6 catégories (data, IA, réglementaire, sécurité, métier, opérationnel) + stratégies de maîtrise + signaux moteur

Les briques IA actives selon l'approche recommandée sont **mises en évidence** dans la couche tech.

### Étape 9 — Livrables (`/projects/[id]/deliverables`)

**7 types de livrables** générés depuis l'EngineReport :

| Type | Contenu | Usage |
|---|---|---|
| Note de cadrage IA | Synthèse executive complète | COPIL / sponsor |
| Fiche de décision | Décision + scoring + justification + conditions | Gouvernance |
| Cartographie | Version textuelle des 6 vues | Annexe technique |
| Analyse data | Sources, qualité, RGPD | DPO / data team |
| Analyse risques | 10 axes + bloquants + mitigation | RSSI / gouvernance |
| Recommandation finale | Forces / faiblesses + règles | Sponsor |
| Plan d'action | Steps ordonnés + pilotes + horizons | Chef de projet |

Pour chaque livrable :
- **Générer / Régénérer** depuis l'EngineReport courant
- **Aperçu** rendu HTML (via `marked`)
- **Télécharger .md** (route GET avec content-disposition)
- **Imprimer / PDF** via `window.print()` + CSS print scoped (cache nav, marges 2cm, page-break avoidance sur titres/tables)

---

## 4. Architecture sous le capot

### 4.1. Couches

```
┌─────────────────────────────────────────────────────────┐
│  Pages / UI                                              │
│  Next.js 16 App Router · React 19 · Tailwind v4         │
└───────────────────────────┬─────────────────────────────┘
                            │ server actions
┌───────────────────────────▼─────────────────────────────┐
│  src/lib/db/snapshot.ts                                  │
│  Frontière I/O → ProjectSnapshot (plain object)          │
└───────────────────────────┬─────────────────────────────┘
                            │ pure
┌───────────────────────────▼─────────────────────────────┐
│  src/lib/engines/                                        │
│  ─ maturity      ─ scoring     ─ decision                │
│  ─ questionnaire ─ cartography ─ deliverables            │
│  Pure TypeScript, zero React, zero Prisma                │
│  → computeEngineReport(snapshot) : EngineReport          │
└───────────────────────────┬─────────────────────────────┘
                            │ persists
┌───────────────────────────▼─────────────────────────────┐
│  Prisma 7 driver adapter                                 │
│  SQLite (dev) | PostgreSQL (Docker, on-premise)          │
└─────────────────────────────────────────────────────────┘
```

### 4.2. Les engines en détail

Tout dans [`src/lib/engines/`](ai-framing-assistant/src/lib/engines/) :

- **[maturity](ai-framing-assistant/src/lib/engines/maturity/signals.ts)** — détecte les signaux faibles/moyens/forts à partir du `ProjectSnapshot`. Émet une liste de `Signal` (catégorie, sévérité, titre, détail) et 4 sous-scores en [0,1] (business, data, aiFit, governance). Inclut la détection « formulation orientée solution » (« nous voulons de l'IA », chatbot, agent…).

- **[scoring](ai-framing-assistant/src/lib/engines/scoring/axes.ts)** — dérive les 6 axes du scoring (note 1-3 + justification texte + confiance) depuis le `ProjectSnapshot` et la `MaturityReport`. Le total /18 mappe vers une décision **brute** via SPEC §177.

- **[decision](ai-framing-assistant/src/lib/engines/decision/rules.ts)** — applique 6 règles métier qui peuvent **abaisser** la décision brute. Retourne un `DecisionResult` avec `rationale: DecisionRationaleItem[]` (STRENGTH / WEAKNESS / BLOCKER / RULE) et `blockers: Signal[]`. Le [`action-plan.ts`](ai-framing-assistant/src/lib/engines/decision/action-plan.ts) produit le plan d'action.

- **[questionnaire](ai-framing-assistant/src/lib/engines/questionnaire/blocks.ts)** — modèle déclaratif des blocs de questions et [`flow.ts`](ai-framing-assistant/src/lib/engines/questionnaire/flow.ts) pour les hints dynamiques (REFORMULATE / ASK / DEEP_DIVE). Prêt pour un futur questionnaire conversationnel.

- **[cartography](ai-framing-assistant/src/lib/engines/cartography/insights.ts)** — `buildInsights()` transforme le snapshot en sections sémantiques typées par layer (BusinessInsights, WorkflowInsights, etc.). Les composants HTML/CSS dans [`src/components/cartography/layers/`](ai-framing-assistant/src/components/cartography/layers/) consomment ces insights. Le générique Node/Edge ([`types.ts`](ai-framing-assistant/src/lib/engines/cartography/types.ts) + [`builders.ts`](ai-framing-assistant/src/lib/engines/cartography/builders.ts)) reste dispo pour exports futurs.

- **[deliverables](ai-framing-assistant/src/lib/engines/deliverables/index.ts)** — 7 générateurs markdown indépendants qui consomment l'`EngineReport` et retournent des `DeliverableContent`.

### 4.3. Point d'entrée unique

[`src/lib/engines/index.ts`](ai-framing-assistant/src/lib/engines/index.ts) expose `computeEngineReport(snapshot)` qui orchestre tout :

```ts
export function computeEngineReport(snapshot: ProjectSnapshot): EngineReport {
  const maturity = analyseMaturity(snapshot);
  const scoring = computeScoring(snapshot);
  const decision = decideFromScoring(snapshot, scoring);
  const actionPlan = buildActionPlan(snapshot, decision);
  const cartography = buildCartography(snapshot, scoring, decision);
  const insights = buildInsights(snapshot, scoring, decision);
  return { maturity, scoring, decision, actionPlan, cartography, insights };
}
```

Toutes les pages appellent `computeEngineReport` et consomment le sous-produit dont elles ont besoin.

### 4.4. Modèle de données

7 entités Prisma dans [`prisma/schema.prisma`](ai-framing-assistant/prisma/schema.prisma) :

```
User                     (rôle pour gouvernance future)
Project                  (entité racine)
  ├─ BusinessNeed        (étape 1 wizard)
  ├─ AIAnalysis          (étape 2 wizard)
  ├─ DataAssessment      (étape 3 wizard)
  ├─ ArchitectureAssessment (étape 4 wizard)
  ├─ RiskAssessment      (étape 5 wizard)
  ├─ Scoring             (étape 6 — résultat du moteur, override possible)
  └─ Deliverable[]       (étape 9 — markdown persisté)
```

Relations 1:1 entre Project et chaque assessment (sauf Deliverable qui est 1:N).

Les enums sont stockés en TEXT (compatible SQLite) avec valeurs autoritatives dans [`src/types/index.ts`](ai-framing-assistant/src/types/index.ts) : `USER_ROLES`, `PROJECT_STATUSES`, `DECISIONS`, `AI_APPROACHES`, etc.

---

## 5. Les 3 projets démo et ce qu'ils enseignent

Lancés par `npm run seed`. Chacun illustre un cas SPEC §389-400 et un comportement spécifique du moteur de décision.

### 5.1. `demo-mailbox` — Automatisation des boîtes mails

- **Décision attendue** : GO_IA (ou POC_IA)
- **Score** : 18/18
- **Approche** : HYBRID (ML + LLM + RAG)
- **Ce qu'on apprend** : projet IA mature classique — données disponibles, valeur claire, risques maîtrisables, validation humaine.

### 5.2. `demo-pmi` — Interprétariat médical PMI

- **Décision attendue** : NO_GO ou STUDY
- **Score brut** : 15/18 → mais **R1 abaisse à NO_GO**
- **Pourquoi** : données sensibles santé (enfants) + risque RGPD critique (5/5) + aucune mitigation documentée
- **Ce qu'on apprend** : un projet « bien noté » n'est pas un projet « bon ». Les règles de gouvernance peuvent bloquer un projet quel que soit son score. Le moteur n'est pas un calculateur — c'est un cadre de raisonnement.

### 5.3. `demo-lad-mdph` — LAD MDPH

- **Décision attendue** : POC_IA
- **Score brut** : 18/18 → mais **R6 abaisse à POC_IA**
- **Pourquoi** : données sensibles (santé / handicap) imposent un POC avant toute mise en production, même avec un plan de mitigation
- **Ce qu'on apprend** : la prudence métier prime sur la maturité technique. Un projet « tout vert » sur le papier doit toujours prouver sa fiabilité par un POC s'il manipule des données sensibles.

Comparer ces 3 cas dans l'interface est la meilleure façon de comprendre le moteur de décision.

---

## 6. Tâches courantes

### Reseed les démos après modification du seed
```bash
npm run seed              # idempotent, écrase les 3 démos
```

### Régénérer le client Prisma
```bash
npx prisma generate
```
À faire après chaque modification du `schema.prisma` ou si `src/generated/prisma/client/` disparaît.

### Régénérer tous les livrables d'un projet
Page `/projects/[id]/deliverables` → bouton **"Générer tous les livrables"**. Ou ligne de commande :
```bash
npx tsx prisma/verify-deliverables.ts
```

### Override un scoring
Page `/projects/[id]/scoring` → modifier les notes 1-3 sur les axes → soumettre. Le scoring persisté écrase l'auto-calcul du moteur pour ce projet.

### Tester une nouvelle règle de décision
Éditer [`src/lib/engines/decision/rules.ts`](ai-framing-assistant/src/lib/engines/decision/rules.ts) → ajouter une règle dans `applyHardRules()` → relancer :
```bash
npx tsx prisma/verify-engines.ts
```
pour vérifier que les 3 cas SPEC restent conformes (et que la nouvelle règle se déclenche sur le bon cas).

### Reset complet de la base SQLite (dev)
```bash
rm ai-framing-assistant/dev.db
npx prisma migrate deploy
npm run seed
```

---

## 7. Dépannage

### Internal Server Error sur localhost
**Cause la plus fréquente** : `src/generated/prisma/client/` manquant.
```bash
cd ai-framing-assistant
npx prisma generate
# Puis Ctrl+C dans le terminal dev et relancer:
npm run dev
```

### `Port 3000 is in use…`
Next.js bascule automatiquement sur 3001. Si tu veux libérer 3000, identifie le process : `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` (PowerShell) ou `lsof -i :3000` (bash).

### Une page engine affiche un message "wizard à compléter"
Toutes les 5 étapes du wizard doivent être remplies pour que le moteur produise un rapport pertinent. Termine d'abord le wizard (n'importe quel projet ou démo). Le `questionnaireFilled` flag est `true` quand `businessNeed && aiAnalysis && dataAssessment && architecture && riskAssessment` existent.

### Le PDF imprimé contient la sidebar / le header
Le CSS print est scoped par `@media print` dans [`globals.css`](ai-framing-assistant/src/app/globals.css). Si tu imprimes depuis Chrome, choisis **"Plus de paramètres → Graphiques d'arrière-plan"** désactivé pour un rendu noir-sur-blanc propre.

### Les démos ne réapparaissent pas après reset
Le seed est idempotent (delete-then-create par `id` stable). Vérifie que tu lances `npm run seed` depuis `ai-framing-assistant/` (le seed lit `prisma/dev.db` relatif).

---

## 8. Pour aller plus loin

- **[SPEC.MD](SPEC.MD)** — spec produit complète (12 étapes)
- **[BUSINESS_LOGIC.md](BUSINESS_LOGIC.md)** — logique métier, ateliers, raisonnement attendu
- **[docs/business/](docs/business/)** — 5 docs engines (Cartography / Decision / Questionnaire / Scoring + Business Vision)
- **[ai-framing-assistant/DEPLOY.md](ai-framing-assistant/DEPLOY.md)** — guide de déploiement Docker / on-premise
- **[ai-framing-assistant/CLAUDE.md](ai-framing-assistant/CLAUDE.md)** — instructions pour Claude Code (dev assistant)

---

## 9. Pistes hors-spec (à brancher)

| Sujet | Pourquoi | Effort estimé |
|---|---|---|
| Provider IA + reformulation | Étape 2 SPEC, transforme le wizard en vrai assistant conversationnel | Moyen — abstraction OpenAI/Azure/Mistral/Ollama |
| Auth.js + rôles | Multi-utilisateur, gouvernance, traçabilité par signataire | Moyen |
| Snapshot décisionnel figé | Audit trail : geler un instant T pour réversibilité | Faible (nouvelle table `DecisionSnapshot`) |
| CI GitHub Action | Faire passer `verify-engines.ts` à chaque PR | Faible |
| Export `.docx` | Word natif (au lieu de markdown copié) | Moyen — lib `docx` (~500 KB) |
