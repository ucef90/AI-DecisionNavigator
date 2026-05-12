# Cartography Engine

## Objectif

Construire une représentation systémique du projet IA.

---

# Cartographies à générer

## Cartographie métier

Visualiser :
- besoins ;
- objectifs ;
- irritants ;
- KPI.

---

## Cartographie workflow

Visualiser :
- étapes ;
- validations ;
- automatisations ;
- décisions ;
- dépendances.

---

## Cartographie des données

Visualiser :
- sources ;
- flux ;
- sensibilité ;
- transformations.

---

## Cartographie technologique

Visualiser :
- OCR ;
- ML ;
- LLM ;
- RAG ;
- APIs ;
- workflows ;
- orchestration.

---

## Cartographie gouvernance

Visualiser :
- validations humaines ;
- responsabilités ;
- contrôles ;
- supervision.

---

# Vision technique future

Le moteur devra gérer :
- graphes ;
- noeuds ;
- relations ;
- dépendances ;
- workflows dynamiques ;
- couches interactives.

# Génération automatique de graphes et cartographies visuelles

## Objectif

L’application doit être capable de générer automatiquement des cartographies visuelles professionnelles à partir des réponses utilisateur.

Ces cartographies doivent ressembler à des livrables de conseil / architecture fonctionnelle, et non à de simples listes ou tableaux.

---

# Types de cartographies à générer

## 1. Cartographie métier

La plateforme doit générer une vue synthétique montrant :
- le besoin métier ;
- les objectifs ;
- la valeur attendue ;
- les KPI ;
- l’impact métier ;
- les irritants principaux.

---

## 2. Cartographie workflow

La plateforme doit générer :
- un workflow actuel ;
- un workflow cible avec IA ;
- les étapes manuelles ;
- les étapes automatisées ;
- les validations humaines ;
- les points de friction.

Exemple de structure :

Entrée utilisateur
→ traitement manuel
→ classification
→ analyse
→ réponse
→ validation
→ sortie

Puis workflow cible :

Entrée utilisateur
→ prétraitement IA
→ classification IA
→ extraction
→ RAG / recherche documentaire
→ génération réponse
→ validation humaine
→ sortie

---

## 3. Cartographie des données

La plateforme doit représenter :
- les sources de données ;
- les flux de données ;
- les usages IA ;
- les types de données ;
- le niveau de sensibilité ;
- les contraintes RGPD ;
- le stockage ;
- l’historisation.

---

## 4. Cartographie des acteurs

La plateforme doit représenter :
- les utilisateurs ;
- les agents ;
- les managers ;
- la DSI ;
- la gouvernance ;
- les superviseurs humains ;
- les responsabilités.

---

## 5. Cartographie technologique

La plateforme doit représenter :
- les interfaces utilisateurs ;
- les couches IA ;
- les APIs ;
- les connecteurs SI ;
- les systèmes externes ;
- la sécurité ;
- les logs ;
- le monitoring.

---

## 6. Cartographie des risques

La plateforme doit représenter :
- risques données ;
- risques IA ;
- risques réglementaires ;
- risques sécurité ;
- risques métier ;
- risques opérationnels ;
- stratégies de maîtrise.

---

# Format visuel attendu

Les cartographies doivent être générées sous forme de :
- graphes ;
- cartes fonctionnelles ;
- diagrammes Mermaid ;
- diagrammes SVG ;
- export PNG ;
- export PDF ;
- blocs visuels interactifs dans l’application.

---

# Fonctionnalités attendues

L’utilisateur doit pouvoir :
- générer automatiquement une cartographie ;
- modifier les blocs ;
- déplacer les éléments ;
- ajouter des risques ;
- relier des systèmes ;
- afficher ou masquer des couches ;
- exporter en image ;
- exporter en PDF ;
- intégrer la cartographie dans un rapport.

---

# Moteur de génération visuelle

Le moteur devra transformer les réponses du questionnaire en objets visuels.

Exemples :

Réponse utilisateur :
“Les emails arrivent dans Outlook.”

→ Noeud généré :
Source de données : Outlook / Emails entrants

Réponse utilisateur :
“Une validation humaine est nécessaire.”

→ Noeud généré :
Contrôle humain / Validation obligatoire

Réponse utilisateur :
“Les données sont sensibles.”

→ Noeud généré :
Risque RGPD / Données sensibles

---

# Structure de données recommandée

Chaque cartographie devra être construite à partir de noeuds et de relations.

## Node

- id
- type
- label
- description
- category
- riskLevel
- dataSensitivity
- automationLevel
- positionX
- positionY

## Edge

- id
- sourceNodeId
- targetNodeId
- type
- label
- riskLevel

---

# Types de noeuds

- business_need
- objective
- kpi
- user
- workflow_step
- data_source
- ai_component
- system
- api
- risk
- governance_control
- human_validation
- decision

---

# Types de relations

- flows_to
- uses
- validates
- generates
- classifies
- analyzes
- stores
- supervises
- triggers
- mitigates

---

# Exigence UX

L’application doit proposer une page dédiée :

/projects/[id]/cartography

Cette page doit contenir :
- vue globale ;
- vue métier ;
- vue workflow ;
- vue data ;
- vue technologie ;
- vue risques ;
- vue gouvernance ;
- bouton export image ;
- bouton export PDF ;
- bouton intégrer au rapport.

---

# Librairies possibles

Le développement peut utiliser :
- React Flow pour les graphes interactifs ;
- Mermaid pour les diagrammes rapides ;
- D3.js pour visualisations avancées ;
- html-to-image pour export PNG ;
- jsPDF pour export PDF.

---

# Résultat attendu

À la fin d’un cadrage projet, l’utilisateur doit obtenir une cartographie visuelle professionnelle montrant :

- le besoin métier ;
- les workflows actuel et cible ;
- les données ;
- les systèmes ;
- les composants IA ;
- les validations humaines ;
- les risques ;
- la gouvernance ;
- la décision finale.