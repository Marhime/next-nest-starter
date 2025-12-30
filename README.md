# Starter — Installation et exécution (FR)

Ce monorepo contient deux applications principales :

- `apps/api` : backend NestJS (API REST + logique métier, Prisma/Postgres, envoi d'emails via Resend)
- `apps/web` : frontend Next.js (App Router, TypeScript, Tailwind)

Ce README explique comment cloner le projet et l'installer sur une autre machine.

## Prérequis

- Node.js >= 18 (le `package.json` recommande Node >=18).
- npm (le projet utilise les workspaces npm). La version utilisée lors du développement est indiquée dans `package.json` (ex: `npm@10.9.2`).
- PostgreSQL (localement ou via un service cloud) pour la base de données.
- (Optionnel) Un compte Resend si vous souhaitez envoyer des emails avec le module mail.

Sur macOS vous pouvez installer les dépendances :

```bash
# installer Node (via nvm ou homebrew) si nécessaire
node -v
npm -v
```

## Étapes d'installation (local)

1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd starter-next-nest
```

2. Installer les dépendances (à la racine — workspaces npm)

```bash
npm install
```

3. Créer les fichiers `.env`

- `apps/api` : créez un fichier `apps/api/.env` contenant au minimum :

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/your_db_name?schema=public"
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.com
WEB_URL=http://localhost:3001   # URL publique de l'application web (utilisée dans les emails)
```

- `apps/web` : copiez `apps/web/.env.example` en `apps/web/.env.local` (ou `.env`) et adaptez si besoin :

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_JAWG_ACCESS_TOKEN="your_jawg_access_token_here"
```

Notes :

- `DATABASE_URL` doit pointer vers une base Postgres accessible. Assurez-vous que Postgres tourne et que la base existe (ou laissez Prisma la créer selon votre workflow).
- `RESEND_API_KEY`, `EMAIL_FROM` et `WEB_URL` sont nécessaires pour le module de mails (Resend). Si vous n'utilisez pas Resend, vous pouvez laisser ces valeurs vides, mais certaines fonctionnalités d'authentification qui envoient des emails échoueront.

4. Préparer la base de données (Prisma)

Se placer dans le dossier `apps/api` :

```bash
cd apps/api

# Vérifier l'état des migrations
npx prisma migrate status

# Si vous partez d'une base vide, appliquer les migrations (ou créer une migration initiale)
npx prisma migrate dev --name init

# Générer le client Prisma (généralement appelé par les migrations)
npx prisma generate

# (Optionnel) Lancer le seed si le projet en contient un
npm run seed
```

Si vous avez des erreurs pendant `prisma migrate status` : vérifiez que `DATABASE_URL` est correctement défini, que Postgres est joignable, et que `npx prisma` existe dans `node_modules` (si nécessaire, exécuter `npm install` à nouveau).

Note sur la migration ajoutée

Ce projet a besoin d'ajouter deux colonnes supplémentaires à la table `properties` : `construction_year` (integer) et `land_surface` (numeric). Après avoir modifié le `schema.prisma` (déjà fait dans le repo), vous pouvez appliquer la migration de deux façons :

- Méthode recommandée (Prisma migrate) :

```bash
# depuis apps/api
cd apps/api
npx prisma migrate dev --name add-construction-and-land
```

- Si vous préférez exécuter une commande SQL directement (par ex. base déjà en production ou accès restreint), un script SQL est fourni : `apps/api/prisma/scripts/add-construction-land.sql`. Vous pouvez l'exécuter avec psql :

```bash
# Exemple (local)
psql "${DATABASE_URL}" -f apps/api/prisma/scripts/add-construction-land.sql
```

Après avoir appliqué la migration, exécutez `npx prisma generate` pour régénérer le client Prisma.

5. Lancer en développement

Depuis la racine (recommandé — lance tous les services via Turbo):

```bash
npm run dev
```

Ou lancer chaque app séparément :

```bash
# Backend
cd apps/api
npm run dev

# Frontend
cd ../web
npm run dev
```

Par défaut :

- L'API écoute sur `http://localhost:3000` (NestJS)
- Le frontend écoute sur `http://localhost:3001` (Next.js)

## Commandes utiles

- Installer les dépendances : `npm install`
- Lancer tout en dev (turbo) : `npm run dev`
- Lancer seulement l'API : `npm --prefix apps/api run dev` ou `cd apps/api && npm run dev`
- Lancer seulement le web : `npm --prefix apps/web run dev` ou `cd apps/web && npm run dev`
- Construire (prod) : `npm run build` (à la racine, utilise Turbo pour builder les apps)
- Lancer en prod : `npm --prefix apps/api run start:prod` et `npm --prefix apps/web run start`

## Variables d'environnement récapitulatives

- `apps/api/.env` (minimum)
  - DATABASE_URL
  - RESEND_API_KEY (optionnel mais recommandé pour emailing)
  - EMAIL_FROM
  - WEB_URL

- `apps/web/.env.local` (ou `.env`)
  - NEXT_PUBLIC_API_URL
  - NEXT_PUBLIC_JAWG_ACCESS_TOKEN (pour les cartes)

Vous trouverez également de la documentation spécifique au module mail dans `apps/api/src/mail/README.md`.

## Tests

- Exécuter tous les tests : `npm run test`
- Lancer les tests e2e (API) : `npm --prefix apps/api run test:e2e`

## Déploiement rapide (notes)

- Assurez-vous de configurer les variables d'environnement en production (DATABASE_URL, RESEND_API_KEY, EMAIL_FROM, WEB_URL, NEXT_PUBLIC_API_URL, etc.).
- Appliquez les migrations Prisma sur la base de données cible : `npx prisma migrate deploy`.
- Construisez les apps (`npm run build`) puis démarrez-les en mode production.

## Dépannage rapide

- `prisma migrate status` échoue → vérifier `DATABASE_URL`, que Postgres accepte les connexions, et réessayer.
- Erreurs d'envoi d'email → vérifier `RESEND_API_KEY`, `EMAIL_FROM` et que le domaine `EMAIL_FROM` est validé chez Resend.
- Frontend ne trouve pas l'API → vérifier `NEXT_PUBLIC_API_URL` dans `apps/web/.env.local`.

## Fichiers importants

- `apps/api` : backend NestJS, Prisma, seed, migrations
- `apps/web` : frontend Next.js
- `packages/*` : packages partagés (config eslint, typescript, composants UI)
