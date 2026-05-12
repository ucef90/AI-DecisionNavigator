Tu es un développeur full-stack senior et architecte SaaS.

Je veux créer une application SaaS appelée :

AI Project Framing Assistant

Objectif :
Créer une plateforme SaaS + version locale/on-premise permettant de guider des chefs de projet, DSI, directions métiers, gouvernance, DPO et équipes data dans le cadrage d’un projet IA.

L’application ne doit pas seulement noter un projet.
Elle doit guider l’utilisateur dans une démarche structurée de décision IA.

But final :
Transformer une idée IA floue en décision argumentée :
- GO IA
- POC IA
- Automatisation simple
- Étude complémentaire
- NO GO IA

==================================================
STACK TECHNIQUE SOUHAITÉE
==================================================

Frontend :
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend :
- Next.js API routes ou FastAPI si nécessaire
- PostgreSQL
- Prisma ORM

IA :
- abstraction provider IA
- compatible OpenAI / Azure OpenAI / Mistral / Ollama
- prévoir version cloud et version locale

Authentification :
- Auth.js ou équivalent
- rôles utilisateurs

Déploiement :
- version cloud
- version Docker local / on-premise

==================================================
RÔLES UTILISATEURS
==================================================

1. Admin
- gestion utilisateurs
- gestion référentiels
- configuration IA
- configuration scoring

2. Chef de projet
- création projet
- cadrage
- analyse
- décision

3. Direction métier
- expression besoin
- validation métier

4. DSI / IT
- analyse faisabilité technique
- architecture
- intégration

5. DDEC / Data
- analyse données
- gouvernance data

6. DPO / RSSI / Gouvernance
- RGPD
- risques
- validation conformité

==================================================
PARCOURS UTILISATEUR PRINCIPAL
==================================================

Étape 1 : Création du projet
Champs :
- nom du projet
- direction
- sponsor
- chef de projet
- description initiale
- contexte métier
- objectif attendu
- utilisateurs concernés
- maturité estimée

Étape 2 : Reformulation du besoin
L’assistant IA doit :
- analyser la demande initiale
- détecter les ambiguïtés
- reformuler le vrai besoin métier
- distinguer solution demandée et problème réel

Étape 3 : Analyse du problème métier
Questionnaire guidé :
- Quel problème cherche-t-on à résoudre ?
- Quelle tâche est chronophage ?
- Quel impact pour agents/usagers ?
- Quels irritants ?
- Quels KPI actuels ?
- Quel résultat attendu ?

Étape 4 : Analyse IA ou pas IA
Le système doit aider à distinguer :
- automatisation simple
- règle métier
- Machine Learning
- LLM
- RAG
- Agent IA
- workflow hybride
- solution classique non IA

Étape 5 : Analyse data
Champs :
- données disponibles
- source des données
- données structurées / non structurées
- historique disponible
- qualité
- accessibilité
- silos
- données personnelles
- données sensibles
- contraintes RGPD

Étape 6 : Analyse architecture / workflow
Champs :
- applications concernées
- APIs disponibles
- workflow existant
- workflow cible
- intégration SI
- supervision humaine
- traçabilité
- outils existants

Étape 7 : Analyse risques / gouvernance
Risques à évaluer :
- RGPD
- données sensibles
- hallucinations
- biais
- erreur de classification
- décision automatisée
- sécurité
- dépendance fournisseur
- adoption utilisateurs
- supervision humaine

Étape 8 : Scoring
Créer un moteur de scoring sur 6 axes :
1. Clarté du besoin
2. Pertinence IA
3. Maturité data
4. Valeur métier
5. Risques maîtrisables
6. Faisabilité technique et organisationnelle

Chaque axe doit être noté de 1 à 3.

Score total : 18.

Lecture :
- 15 à 18 : GO IA ou POC rapide
- 10 à 14 : POC / étude complémentaire / cadrage data
- 6 à 9 : projet IA peu mature
- moins de 6 : NO GO IA / automatisation simple / solution alternative

Étape 9 : Décision finale
L’application doit proposer :
- GO IA
- POC IA
- Automatisation simple
- Étude complémentaire
- NO GO IA

Avec justification détaillée.

Étape 10 : Génération des livrables
Générer :
- note de cadrage IA
- fiche de décision IA
- cartographie du projet
- analyse data
- analyse risques
- recommandation finale
- plan d’action
- export PDF
- export Word si possible

==================================================
MODULES À DÉVELOPPER
==================================================

1. Dashboard
- liste projets
- statut
- décision
- score
- risques
- maturité

2. Création projet
- wizard multi-étapes

3. Assistant IA de reformulation
- champ texte
- bouton “reformuler”
- sortie structurée

4. Questionnaire dynamique
- métier
- data
- IA
- risques
- architecture

5. Moteur de scoring
- calcul automatique
- justification
- recommandation

6. Cartographie visuelle
- besoin
- données
- technologies
- workflow
- risques
- décision

7. Génération de livrables
- rapport markdown
- export PDF

8. Gestion rôles utilisateurs
- Admin
- Chef de projet
- Data
- DSI
- DPO

9. Configuration IA
- cloud provider
- local provider
- modèle utilisé

10. Mode local/on-premise
- Docker Compose
- PostgreSQL local
- Ollama possible
- variables d’environnement

==================================================
MODÈLE DE DONNÉES MINIMUM
==================================================

Créer les entités :

User
- id
- name
- email
- role

Project
- id
- name
- direction
- sponsor
- description
- status
- maturity
- finalDecision
- totalScore
- createdAt

BusinessNeed
- projectId
- initialRequest
- reformulatedNeed
- painPoints
- expectedValue
- usersImpacted

DataAssessment
- projectId
- dataSources
- dataTypes
- quality
- availability
- sensitivity
- rgpdConstraints
- silos

AIAnalysis
- projectId
- automationRelevant
- mlRelevant
- llmRelevant
- ragRelevant
- agentRelevant
- recommendedApproach
- justification

ArchitectureAssessment
- projectId
- applications
- apis
- workflowCurrent
- workflowTarget
- humanValidation
- traceability

RiskAssessment
- projectId
- rgpdRisk
- biasRisk
- hallucinationRisk
- securityRisk
- adoptionRisk
- overallRisk
- mitigationPlan

Scoring
- projectId
- needClarity
- aiRelevance
- dataMaturity
- businessValue
- riskControl
- feasibility
- total
- recommendation

Deliverable
- projectId
- type
- content
- createdAt

==================================================
UI / UX ATTENDUE
==================================================

Design :
- sobre
- professionnel
- SaaS B2B
- clair
- moderne

Pages :
- /dashboard
- /projects
- /projects/new
- /projects/[id]
- /projects/[id]/wizard
- /projects/[id]/scoring
- /projects/[id]/cartography
- /projects/[id]/deliverables
- /settings

Expérience :
- wizard étape par étape
- progression visible
- cartes synthétiques
- graphiques simples
- badges GO / POC / NO GO
- rapport généré automatiquement

==================================================
CAS EXEMPLES À INTÉGRER EN DONNÉES DE DÉMO
==================================================

Projet 1 : Automatisation des boîtes mails
Décision attendue : GO IA ou POC IA
Technos : ML + LLM + workflow + supervision humaine

Projet 2 : Interprétariat PMI
Décision attendue : NO GO IA immédiat ou étude complémentaire
Raisons : données sensibles, santé, précision critique, risque élevé

Projet 3 : LAD MDPH
Décision attendue : POC ou cadrage renforcé
Technos : OCR + LAD + IA documentaire + intégration SI

==================================================
CE QUE JE VEUX QUE TU FASSES
==================================================

Commence par créer une architecture complète du projet.

Puis implémente étape par étape :

1. Initialiser projet Next.js + TypeScript + Tailwind.
2. Installer shadcn/ui.
3. Créer le layout principal.
4. Créer les pages dashboard et projets.
5. Créer le modèle de données Prisma.
6. Créer les formulaires de création projet.
7. Créer le wizard de cadrage.
8. Créer le moteur de scoring.
9. Créer la page cartographie.
10. Créer la génération de livrable markdown/PDF.
11. Ajouter des données de démonstration.
12. Ajouter Docker Compose pour version locale.

IMPORTANT :
Travaille par étapes.
Après chaque grande étape, explique ce qui a été créé.
Ne code pas tout dans un seul fichier.
Structure proprement le projet.
Prévois une architecture maintenable.