# Valoravis - Documentation technique

## Sommaire

1. [Architecture](#1-architecture)
2. [Stack technique](#2-stack-technique)
3. [Installation](#3-installation)
4. [Variables d'environnement](#4-variables-denvironnement)
5. [Base de données](#5-base-de-données)
6. [Authentification](#6-authentification)
7. [Établissements et rôles](#7-établissements-et-rôles)
8. [Routes API](#8-routes-api)
9. [Server Actions](#9-server-actions)
10. [Services](#10-services)
11. [Configuration métiers](#11-configuration-métiers)
12. [Plans et features](#12-plans-et-features)
13. [Sécurité](#13-sécurité)
14. [Tests](#14-tests)
15. [Déploiement](#15-déploiement)
16. [Cron jobs](#16-cron-jobs)

---

## 1. Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Pages authentification (login, register, invite/[token])
│   ├── (admin)/            # Pages admin (dashboard, users/etablissements, plans)
│   ├── (dashboard)/        # Pages protegees (dashboard, clients, establishments, settings, billing)
│   ├── (public)/           # Pages publiques (review/[token])
│   ├── api/                # Routes API (auth, cron, webhooks)
│   └── page.tsx            # Landing page
├── actions/                # Server Actions
│   ├── auth.ts             # Inscription, login, verification, invitation
│   ├── dashboard.ts        # Clients, campagnes, templates, parametres
│   ├── establishments.ts   # CRUD etablissements, membres, invitations
│   ├── admin.ts            # Actions admin
│   └── review.ts           # Soumission avis client
├── components/             # Composants React
│   ├── dashboard/          # Composants du dashboard + etablissements
│   ├── landing/            # Composants de la page vitrine
│   ├── review/             # Composants du parcours client (notation)
│   └── ui/                 # Composants UI reutilisables
├── config/                 # Configuration (niches, plans, limites)
├── generated/prisma/       # Client Prisma genere
├── lib/                    # Bibliothèques utilitaires
│   ├── auth.ts             # Configuration NextAuth
│   ├── establishment.ts    # Helpers etablissement (current, role, owner)
│   ├── prisma.ts           # Client Prisma singleton
│   ├── resend.ts           # Service email (Resend)
│   ├── sms.ts              # Service SMS (Twilio)
│   ├── stripe.ts           # Integration Stripe
│   ├── rate-limit.ts       # Rate limiter in-memory
│   └── utils.ts            # Fonctions utilitaires
├── services/               # Logique metier
│   └── review-request.service.ts
└── types/                  # Types TypeScript
```

### Flux de données

```
Client (navigateur)
  → Server Components (rendu serveur)
  → Server Actions (mutations)
  → Services (logique metier)
  → Prisma (base de données)
  → Services externes (Resend, Twilio, Stripe)
```

---

## 2. Stack technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (Turbopack) | 16.2.2 |
| Runtime | React | 19.2.4 |
| Langage | TypeScript | 5 |
| CSS | TailwindCSS | 4 |
| ORM | Prisma | 7.6.0 |
| BDD | PostgreSQL (Supabase) | 15+ |
| Auth | NextAuth.js | 5.0.0-beta.30 |
| Email | Resend | 6.10.0 |
| SMS | Twilio | 5.13.1 |
| Paiement | Stripe | 22.0.0 |
| Icones | Lucide React | 1.7.0 |
| Securite | bcryptjs | 3.0.3 |

---

## 3. Installation

### Prérequis

- Node.js 20+
- npm
- PostgreSQL (ou compte Supabase)

### Setup

```bash
# Cloner le repo
git clone https://github.com/habibmahjoubi/valoravis.git
cd valoravis

# Installer les dependances
npm install

# Copier les variables d'environnement
cp .env.example .env
# Editer .env avec vos valeurs

# Générer le client Prisma
npx prisma generate

# Synchroniser le schéma avec la BDD
npx prisma db push

# Lancer en dev
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### Build production

```bash
npm run build
npm start
```

---

## 4. Variables d'environnement

### Base de données

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL (via PgBouncer pour les requetes) | `postgresql://user:pass@host:6543/db?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | URL directe (pour les migrations Prisma) | `postgresql://user:pass@host:5432/db` |

### Authentification

| Variable | Description | Exemple |
|----------|-------------|---------|
| `AUTH_SECRET` | Secret pour signer les tokens JWT | `openssl rand -base64 32` |
| `AUTH_URL` | URL de base de l'application | `https://valoravis.example.com` |
| `AUTH_TRUST_HOST` | Requis derriere un proxy (Vercel) | `true` |

### Services externes

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Cle API Resend |
| `EMAIL_FROM` | Adresse d'envoi (ex: `Valoravis <noreply@domain.com>`) |
| `TWILIO_ACCOUNT_SID` | SID du compte Twilio |
| `TWILIO_AUTH_TOKEN` | Token Twilio |
| `TWILIO_PHONE_NUMBER` | Numero d'envoi SMS |
| `STRIPE_SECRET_KEY` | Cle secrete Stripe |
| `STRIPE_PUBLISHABLE_KEY` | Cle publique Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret de verification webhook |
| `STRIPE_PRICE_PRO` | Price ID Stripe du plan Pro |
| `STRIPE_PRICE_BUSINESS` | Price ID Stripe du plan Business |

### Application

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app |
| `CRON_SECRET` | Token bearer pour l'endpoint cron |

---

## 5. Base de données

### Schéma principal

#### User
Compte utilisateur du SaaS.

```
id               String    @id @default(cuid())
email            String    @unique
emailVerified    DateTime?
password         String?   # Hash bcrypt
name             String?
businessName     String?
niche            Niche     @default(DENTIST)  # DENTIST | OSTEOPATH | GARAGE | OTHER
customNiche      String?
googlePlaceUrl   String?
phone            String?
stripeCustomerId String?   @unique
plan             String    @default("free")
monthlyQuota     Int       @default(50)
quotaUsed        Int       @default(0)
onboarded        Boolean   @default(false)
satisfactionThreshold Int  @default(4)  # 1-5
defaultChannel   Channel   @default(EMAIL)
defaultDelay     Int?      # Heures, null = defaut du metier
senderName       String?
replyToEmail     String?
trialEndsAt      DateTime?
cancelRequestedAt DateTime?
cancelEffectiveAt DateTime?
```

#### Establishment
Etablissement (cabinet, garage, salon...).

```
id                    String   @id @default(cuid())
name                  String
niche                 Niche    @default(DENTIST)
customNiche           String?
googlePlaceUrl        String?
phone                 String?
satisfactionThreshold Int      @default(4)
defaultChannel        Channel  @default(EMAIL)
defaultDelay          Int?
senderName            String?
replyToEmail          String?
isActive              Boolean  @default(true)
```

Relations : `members[]`, `clients[]`, `reviewRequests[]`, `templates[]`, `invitations[]`

#### EstablishmentMember
Liaison User ↔ Establishment avec role.

```
id              String     @id @default(cuid())
userId          String     # FK → User
establishmentId String     # FK → Establishment
role            MemberRole # OWNER | ADMIN | MEMBER
```

Contrainte unique : `@@unique([userId, establishmentId])`

#### EstablishmentInvitation
Invitation en attente (utilisateur sans compte).

```
id              String     @id @default(cuid())
establishmentId String     # FK → Establishment
email           String
role            MemberRole
token           String     @unique  # 256 bits hex
invitedBy       String     # FK → User
expires         DateTime   # 7 jours
```

Contrainte unique : `@@unique([establishmentId, email])`

#### Client
Contact/client d'un etablissement.

```
id              String   @id @default(cuid())
userId          String   # FK → User
establishmentId String?  # FK → Establishment
name            String
email           String?
phone           String?
notes           String?
```

#### ReviewRequest
Demande d'avis individuelle.

```
id              String   @id @default(cuid())
userId          String   # FK → User
clientId        String   # FK → Client
establishmentId String?  # FK → Establishment
channel         Channel  # EMAIL | SMS
status          Status   # PENDING | SENT | CLICKED | REVIEWED | FEEDBACK | FAILED
token           String   @unique  # Identifiant unique dans le lien
scheduledAt     DateTime?
sentAt          DateTime?
clickedAt       DateTime?
rating          Int?     # 1-5
feedback        String?
```

#### Template
Templates de messages personnalises.

```
id              String  @id @default(cuid())
userId          String  # FK → User
establishmentId String? # FK → Establishment
name            String
niche           Niche
channel         Channel
subject         String? # Email uniquement
body            String
isDefault       Boolean @default(false)
```

#### Plan
Configuration des plans tarifaires.

```
id            String  @id @default(cuid())
key           String  @unique  # "free", "pro", "business"
name          String
price         Int     # Centimes
quota         Int     # 0 = illimite
maxUsers      Int     @default(1)
trialDays     Int     @default(0)
stripePriceId String?
isActive      Boolean @default(true)
sortOrder     Int     @default(0)
```

---

## 6. Authentification

### Configuration NextAuth v5

- **Stratégie** : JWT (7 jours d'expiration)
- **Provider** : Credentials (email + mot de passe)
- **Adaptateur** : PrismaAdapter

### Flux de connexion

1. L'utilisateur soumet email + mot de passe
2. Rate limiting verifie (5 tentatives / 15 min)
3. Recherche utilisateur en BDD
4. Comparaison bcrypt (timing-safe avec dummy hash)
5. Verification `emailVerified` non null
6. Token JWT genere avec `user.id`

### Protection des routes

Les pages sous `(dashboard)/` verifient la session via `auth()` et redirigent vers `/login` si absente.

---

## 7. Établissements et rôles

### Architecture

```
User (compte/login)
  └── EstablishmentMember (role: OWNER | ADMIN | MEMBER)
        └── Establishment (cabinet, garage...)
              ├── Clients
              ├── ReviewRequests
              └── Templates
```

Un User peut etre membre de plusieurs etablissements avec des roles differents. Un Establishment peut avoir plusieurs membres.

### Hierarchie des roles

```typescript
const ROLE_LEVEL = { OWNER: 3, ADMIN: 2, MEMBER: 1 };
```

| Role | Niveau | Description |
|------|--------|-------------|
| OWNER | 3 | Proprietaire — tout acces, facturation, suppression |
| ADMIN | 2 | Administrateur — parametres, clients, templates, invitations |
| MEMBER | 1 | Membre — consultation, ajout clients, envoi demandes |

### Verification des roles

```typescript
import { requireRole } from "@/lib/establishment";

// Verifie que l'utilisateur a au moins le role ADMIN sur l'etablissement
await requireRole(userId, establishmentId, "ADMIN");
```

### Etablissement courant

L'etablissement actif est stocke dans un cookie `current-establishment-id` (httpOnly, secure en prod, sameSite=lax, 1 an). Il est verifie en BDD a chaque requete via `getCurrentEstablishment()`.

```typescript
import { getCurrentEstablishment } from "@/lib/establishment";

const establishment = await getCurrentEstablishment();
// Returns { ...establishment, role: "OWNER" | "ADMIN" | "MEMBER" } or null
```

Si aucun cookie n'est defini, le fallback selectionne le premier etablissement du user et pose le cookie automatiquement.

### Heritage du plan

Les membres (ADMIN, MEMBER) heritent du plan du proprietaire (OWNER) de l'etablissement :

```typescript
import { getEstablishmentOwner } from "@/lib/establishment";

const owner = await getEstablishmentOwner(establishmentId);
const effectivePlan = owner?.plan ?? user.plan;
```

Cela affecte : les features disponibles (SMS, CSV, templates, stats), le quota affiche, et les verifications dans toutes les actions.

### Flux d'invitation

1. OWNER/ADMIN appelle `inviteMember(email, role)` depuis `/dashboard/establishments`
2. Si l'email a un compte : ajout direct + email de notification
3. Si l'email n'a pas de compte : creation d'un `EstablishmentInvitation` (token 256 bits, expire 7j) + email avec lien `/invite/TOKEN`
4. La page `/invite/TOKEN` affiche un formulaire simplifie (nom + mot de passe, email verrouille)
5. L'action `acceptInvitation` cree le compte auto-verifie + rattache a l'etablissement
6. Réponse identique dans les deux cas pour éviter l'énumération d'emails

### Limites par plan

```typescript
// src/config/plan-features.ts
ESTABLISHMENT_LIMIT = { free: 1, pro: 5, business: 50 };
MEMBERS_PER_ESTABLISHMENT = { free: 1, pro: 3, business: 999 };
```

La verification s'effectue au moment de la creation d'etablissement et de l'invitation de membres.

---

## 8. Routes API

### `GET|POST /api/cron/send-reviews`

Traite les demandes d'avis en attente.

- **Méthodes** : GET (Vercel Cron) et POST (appels externes)
- **Auth** : Bearer token (`CRON_SECRET`), comparaison timing-safe
- **Réponse** : `{ ok: boolean, sent: number, failed: number, timestamp: string }`
- **Logique** : Trouve les `ReviewRequest` avec `status=PENDING` et `scheduledAt <= now`, envoie par lot de 50

### `POST /api/webhooks/stripe`

Reçoit les événements Stripe.

- **Auth** : Signature webhook Stripe
- **Événements gérés** :
  - `checkout.session.completed` — Active le plan et le quota
  - `invoice.paid` — Reinitialise le quota mensuel
  - `customer.subscription.deleted` — Retour au plan gratuit

### `POST /api/billing/cancel`

Demande d'annulation d'abonnement.

- **Auth** : Session NextAuth
- **Réponse** : `{ success: boolean }`
- **Effet** : Enregistre `cancelRequestedAt`, notifie les admins par email

### `POST /api/auth/[...nextauth]`

Routes NextAuth standard (signin, signout, session, csrf, providers).

---

## 9. Server Actions

### `src/actions/dashboard.ts`

| Action | Description | Validation |
|--------|-------------|------------|
| `completeOnboarding(formData)` | Finalise l'inscription | businessName requis |
| `addClient(formData)` | Ajoute un client | nom requis, email ou phone |
| `updateClient(formData)` | Modifie un client | verification proprietaire |
| `deleteClient(formData)` | Supprime un client | verification proprietaire |
| `importClients(csvString)` | Import CSV en masse | validation ligne par ligne, anti-injection CSV |
| `sendReviewRequest(formData)` | Cree une demande d'avis | quota atomique, IDOR, anti-doublon 7j |
| `updateSendingSettings(formData)` | Preferences d'envoi | canal, delai, phone |
| `updateSettings(formData)` | Profil etablissement | longueurs max |
| `updateThreshold(formData)` | Seuil de satisfaction | 1-5 |
| `saveTemplate(formData)` | Cree/modifie un template | plan Pro+ |
| `deleteTemplate(formData)` | Supprime un template | verification proprietaire |
| `startTrial(formData)` | Demarre un essai gratuit | pas de trial actif |

### `src/actions/establishments.ts`

| Action | Role min | Description |
|--------|----------|-------------|
| `createEstablishment(formData)` | OWNER | Cree un etablissement + membership OWNER |
| `updateEstablishment(formData)` | ADMIN | Modifie nom, niche, URL, telephone |
| `deleteEstablishment(id)` | OWNER | Supprime (sauf le dernier) |
| `switchEstablishment(id)` | MEMBER | Change l'etablissement actif (cookie) |
| `inviteMember(formData)` | ADMIN | Invite par email (existant ou nouveau) |
| `removeMember(formData)` | ADMIN | Retire un membre (sauf OWNER) |
| `updateMemberRole(formData)` | OWNER | Change le role ADMIN ↔ MEMBER |
| `updateEstablishmentSendingSettings(formData)` | ADMIN | Preferences envoi de l'etablissement |
| `updateEstablishmentThreshold(formData)` | ADMIN | Seuil de satisfaction |

### `src/actions/auth.ts`

| Action | Description | Rate limit |
|--------|-------------|------------|
| `registerUser(formData)` | Inscription | 5/15min email, 3/5min IP |
| `verifyEmail(token)` | Verification email | Token 24h |
| `resendVerificationEmail(email)` | Renvoyer verification | 3/15min |
| `requestPasswordReset(formData)` | Mot de passe oublie | 3/h |
| `resetPassword(formData)` | Nouveau mot de passe | Token 1h |
| `acceptInvitation(formData)` | Cree un compte via invitation | 5/15min IP |

### `src/actions/review.ts`

| Action | Description |
|--------|-------------|
| `submitRating(token, rating, feedback?)` | Soumission de la note client |

---

## 10. Services

### `review-request.service.ts`

#### `createReviewRequest(userId, clientId, channel, delayHours)`

1. Transaction interactive atomique (anti race condition sur le quota)
2. Verifie la propriete du client (anti IDOR)
3. Verifie le quota mensuel
4. Anti-doublon : pas de demande au meme client dans les 7 derniers jours
5. Cree le `ReviewRequest` + incremente `quotaUsed` dans la meme transaction
6. Si `delayHours === 0` : envoi immediat (template resanitise avant envoi)
7. Sinon : `scheduledAt = now + delayHours`
8. Resolution du template : custom (si defaut) > template par defaut du metier
9. Interpolation des variables : `{{clientName}}`, `{{businessName}}`, `{{link}}`

#### `processPendingRequests()`

1. Trouve les `ReviewRequest` ou `status=PENDING` et `scheduledAt <= now`
2. Limite : 50 par execution
3. Pour chaque : resanitise le template HTML, envoie email/SMS, met a jour `status=SENT` et `sentAt`
4. En cas d'echec : `status=FAILED`
5. Retourne `{ sent, failed }`

---

## 11. Configuration métiers

Fichier : `src/config/niches.ts`

Chaque metier definit :

```typescript
{
  label: string,           // "Cabinet dentaire"
  defaultDelay: number,    // Heures avant envoi
  vocabulary: {
    client: string,        // "patient" | "client"
    clients: string,       // "patients" | "clients"
    establishment: string, // "cabinet" | "garage" | "etablissement"
    visit: string,         // "consultation" | "seance" | "intervention"
  },
  templates: {
    EMAIL: { subject, body },
    SMS: { body },
  },
  presets: {
    EMAIL: [Formel, Amical, Relance],
    SMS: [Formel, Amical, Relance],
  }
}
```

| Metier | Delai | Client | Etablissement |
|--------|-------|--------|---------------|
| DENTIST | 2h | patient | cabinet |
| OSTEOPATH | 3h | patient | cabinet |
| GARAGE | 24h | client | garage |
| OTHER | 4h | client | etablissement |

---

## 12. Plans et features

Fichier : `src/config/plan-features.ts`

### Matrice des features

| Feature | free | pro | business |
|---------|------|-----|----------|
| `sms` | Non | Oui | Oui |
| `custom_templates` | Non | Oui | Oui |
| `csv_import` | Non | Oui | Oui |
| `detailed_stats` | Non | Oui | Oui |
| `advanced_stats` | Non | Non | Oui |
| `priority_support` | Non | Non | Oui |

### Limites d'import CSV

| Plan | Max lignes |
|------|-----------|
| free | 0 |
| pro | 100 |
| business | 5000 |

### Limites etablissements

| Plan | Etablissements | Membres/etablissement |
|------|---------------|----------------------|
| free | 1 | 1 |
| pro | 5 | 3 |
| business | 50 | 999 |

### Verification

```typescript
import { hasFeature } from "@/config/plan-features";

if (hasFeature(user.plan, "sms")) {
  // L'utilisateur a acces aux SMS
}
```

---

## 13. Sécurité

### Mots de passe

- Hash bcrypt avec 12 salt rounds
- Comparaison timing-safe (dummy hash pour eviter l'enumeration d'emails)
- Regles : 8+ caracteres, 1 majuscule, 1 chiffre

### Headers de securite (next.config.ts)

- `X-Powered-By` desactive (`poweredByHeader: false`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin` (global), `no-referrer` (pages `/review/*`)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy` restrictive avec `frame-src` Stripe
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Protection des données

- Tokens de verification hashes (SHA-256) en BDD
- Verification email obligatoire avant connexion
- Token de review a usage unique
- Feedback client prive (non publie)
- Templates HTML resanitises a chaque envoi (defense in depth)
- Protection anti-injection CSV (formules Excel bloquees)
- Sanitisation des headers email (fromName)

### Isolation des etablissements

- Toutes les requetes dashboard sont scopees par `establishmentId`
- Le cookie `current-establishment-id` est verifie en BDD a chaque requete (anti-IDOR)
- Les clients, review requests et templates sont filtres par `establishmentId` dans les clauses `where`
- Les actions destructives (delete, update) verifient que l'objet appartient a l'etablissement courant
- Les invitations utilisent des tokens cryptographiques de 256 bits avec expiration 7 jours
- Les reponses d'invitation sont uniformes (pas d'enumeration d'emails)
- Le cookie utilise `secure: true` en production, `httpOnly`, `sameSite: lax`

### Protection anti-bot

- Honeypot invisible sur les formulaires login et register
- Verification de timing (rejet si soumission < 1-2 secondes)
- `robots.txt` bloquant `/api/`, `/dashboard/`, `/review/`, pages auth

### Rate limiting public

| Endpoint | Limite |
|----------|--------|
| Login | 5 / 15 min par email |
| Inscription | 5 / 15 min par email, 3 / 5 min par IP |
| Reset mot de passe | 3 / heure par email |
| Renvoi verification | 3 / 15 min par email, 5 / 15 min par IP |
| Soumission avis | 10 / heure par IP |

---

## 14. Tests

### Framework

- **Vitest** v4.1.4
- Environnement Node.js, globals actives
- Fichiers dans `tests/**/*.test.ts`
- Alias `@` → `src/`

### Execution

```bash
npm test          # Run once
npm run test:watch # Watch mode
```

### Fichiers de tests (220 tests)

| Fichier | Tests | Couverture |
|---------|-------|-----------|
| `tests/config/niches.test.ts` | Configurations metier |
| `tests/config/plan-features.test.ts` | Features par plan, limites import |
| `tests/config/establishment-limits.test.ts` | Limites etablissements/membres par plan |
| `tests/lib/utils.test.ts` | sanitizeHtml, escapeHtml, formatDate, formatPrice |
| `tests/lib/validation.test.ts` | Validation email, mot de passe |
| `tests/lib/rate-limit.test.ts` | Rate limiter in-memory |
| `tests/lib/sms-formatting.test.ts` | Formatage SMS |
| `tests/lib/establishment-roles.test.ts` | Hierarchie des roles, matrice de permissions |
| `tests/lib/establishment-validation.test.ts` | Validation champs, limites, CUID, anti-injection |
| `tests/lib/plan-inheritance.test.ts` | Heritage plan OWNER → ADMIN/MEMBER |

---

## 15. Déploiement

### Vercel (recommande)

1. Connectez le repo GitHub a Vercel
2. Configurez les variables d'environnement (voir section 4)
3. Le build command par defaut fonctionne : `prisma generate && next build`
4. Déploiement automatique à chaque push sur `main`

### Variables Vercel requises

Toutes les variables de la section 4, plus :
- `AUTH_TRUST_HOST=true` (obligatoire derriere le proxy Vercel)

### Base de données

- Supabase (PostgreSQL) recommande
- Utiliser le port 6543 (PgBouncer) pour `DATABASE_URL`
- Utiliser le port 5432 (direct) pour `DIRECT_DATABASE_URL`

### Synchronisation du schema

```bash
# Depuis la machine locale avec DIRECT_DATABASE_URL
npx prisma db push
```

---

## 16. Cron jobs

### Envoi des demandes programmees

L'endpoint `GET|POST /api/cron/send-reviews` doit etre appele regulierement pour traiter les demandes en attente.

#### Configuration Vercel Cron

Ajoutez dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reviews",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

#### Authentification

L'endpoint verifie le header `Authorization: Bearer <CRON_SECRET>`. Vercel injecte automatiquement ce header pour les crons configures.

#### Monitoring

Chaque execution retourne :

```json
{
  "ok": true,
  "sent": 12,
  "failed": 0,
  "timestamp": "2026-04-12T..."
}
```
