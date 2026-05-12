# Déploiement

AI Decision Navigator se déploie selon deux modes complémentaires :

| Mode | Base de données | Setup | Cible |
|---|---|---|---|
| **Dev local** | SQLite (`prisma/dev.db`) | `npm install && npm run dev` | Itération rapide, démos |
| **Docker / on-premise** | PostgreSQL 16 | `docker compose up --build` | Recette, production locale, on-premise |

Le code applicatif est strictement identique entre les deux modes.
La sélection du driver Prisma se fait au runtime à partir du scheme de `DATABASE_URL` (`file:` → SQLite, `postgresql://` → Postgres).

---

## 1. Mode dev local (SQLite)

```bash
cd ai-framing-assistant
npm install
npx prisma migrate deploy       # applique les migrations SQLite
npm run seed                    # optionnel : seed des 3 projets démo
npm run dev                     # http://localhost:3000
```

Aucun service externe requis. Le fichier `prisma/dev.db` est créé automatiquement.

---

## 2. Mode Docker (PostgreSQL)

### Démarrage rapide

```bash
cd ai-framing-assistant
cp .env.example .env            # adapter au besoin
docker compose up --build       # build + start
```

À la première exécution :
1. Le service `db` (Postgres 16) démarre, son healthcheck passe.
2. Le service `app` est buildé :
   - `scripts/prepare-postgres.mjs` réécrit `prisma/schema.prisma` (provider → `postgresql`).
   - `npx prisma generate` produit le client Postgres dans `src/generated/prisma`.
   - `npm run build` produit l'output Next.js standalone.
3. À l'`entrypoint` du conteneur :
   - On attend que Postgres soit joignable.
   - `npx prisma db push` crée le schéma dans la base.
   - Si `SEED_DEMO=true`, on insère les 3 projets démo SPEC.
   - Next.js démarre sur le port 3000.

Accès :
- App : http://localhost:${APP_PORT:-3000}
- Postgres (depuis l'hôte) : `postgresql://ain:ain_local_dev_password@localhost:${DB_PORT:-5433}/ai_navigator`

### Variables d'environnement principales

Voir [`.env.example`](.env.example) — un récap rapide :

| Var | Défaut | Rôle |
|---|---|---|
| `DATABASE_URL` | `postgresql://…@db:5432/ai_navigator` (auto dans Docker) | URL Postgres |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `ain` / … / `ai_navigator` | Credentials Postgres |
| `DB_PORT` | `5433` | Port host → Postgres |
| `APP_PORT` | `3000` | Port host → app |
| `SEED_DEMO` | `true` | Seed les 3 projets démo au premier boot |

### Commandes utiles

```bash
# Logs en direct
docker compose logs -f app

# Redémarrer après modification du code
docker compose up --build app

# Connexion psql
docker compose exec db psql -U ain -d ai_navigator

# Tear-down complet (volume Postgres compris)
docker compose down -v
```

---

## 3. Service Ollama (futur — LLM local)

Le `docker-compose.yml` contient un service `ollama` commenté. Il sera activé
lors de l'introduction de la couche provider IA (étape 2 SPEC, reformulation
métier). Activation :

1. Décommenter le bloc `ollama:` et le volume `ain-ollama:`.
2. `docker compose up -d ollama`.
3. `docker compose exec ollama ollama pull llama3.1`.
4. Définir dans l'env de `app` :
   ```
   AI_PROVIDER=ollama
   AI_BASE_URL=http://ollama:11434/v1
   AI_MODEL=llama3.1
   ```

---

## 4. Architecture du build Docker

Image multi-stage (`Dockerfile`) :

```
node:22-alpine
├─ deps      → npm ci (cache layer)
├─ builder   → prepare-postgres + prisma generate + next build
└─ runner    → minimal Next.js standalone + Prisma + pg + tsx
```

Résultat typique : ~250 MB, démarrage <2s après que Postgres est ready.

---

## 5. Bascule de mode

Le schéma `prisma/schema.prisma` reste **SQLite par défaut** pour préserver
le workflow dev. Le script `scripts/prepare-postgres.mjs` est **idempotent** :
- Première exécution : transforme `provider = "sqlite"` → `provider = "postgresql"`.
- Exécutions suivantes : no-op si déjà Postgres.

⚠️ Ne pas committer un `schema.prisma` modifié par ce script — le mode dev
local ne fonctionnerait plus. Le `.dockerignore` empêche déjà la fuite du
schema transformé hors de l'image.

---

## 6. Production cloud

Pour un déploiement Vercel + Postgres managé :
1. Provisionner Postgres (Neon / Supabase / RDS).
2. Définir `DATABASE_URL=postgresql://…` dans les env Vercel.
3. Configurer le build command : `node scripts/prepare-postgres.mjs && npx prisma generate && next build`.
4. Au premier déploiement : depuis une CI ou en local pointant sur la prod,
   exécuter `npx prisma db push` pour créer le schéma.

Aucune réécriture applicative n'est requise — `lib/prisma.ts` détecte
automatiquement le driver à partir de `DATABASE_URL`.
