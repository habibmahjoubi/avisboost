# Valoravis - User Stories

> **Projet** : Valoravis - Plateforme SaaS de collecte d'avis Google pour professionnels locaux
> **Version** : 1.1
> **Derniere mise a jour** : 2026-04-12
> **Niches cibles** : Dentistes, Osteopathes, Garages automobiles (extensible)

---

## Legende

| Priorite | Signification |
|----------|---------------|
| P0 | Indispensable pour le MVP |
| P1 | Important, a livrer rapidement apres le MVP |
| P2 | Souhaitable, peut attendre une v2 |
| P3 | Nice-to-have, backlog |

| Statut | Signification |
|--------|---------------|
| DONE | Implemente et fonctionnel |
| IN PROGRESS | En cours de developpement |
| TODO | A faire |
| PLANNED | Prevu pour une version future |

---

## 1. Authentification et compte

### US01 - Creer un compte `P0` `DONE`

**En tant que** professionnel local (dentiste, osteopathe, garagiste),
**je veux** creer un compte avec mon email et un mot de passe,
**afin de** acceder a la plateforme et commencer a collecter des avis.

**Criteres d'acceptation :**
- [x] L'utilisateur peut s'inscrire avec email + mot de passe (min 8 chars, 1 majuscule, 1 chiffre)
- [x] Un email de verification est envoye via Resend (lien valide 24h)
- [x] L'utilisateur doit verifier son email avant de pouvoir se connecter
- [x] L'utilisateur choisit sa niche (metier) et son plan des l'inscription
- [x] Le compte est cree en base avec le plan choisi
- [x] Rate limiting : 5 tentatives/15min par email, 3/5min par IP
- [x] Protection anti-bot : honeypot sur le formulaire

**Implementation :** Email/password via NextAuth v5 Credentials + verification email + bcrypt (12 rounds)

---

### US02 - Me connecter `P0` `DONE`

**En tant que** utilisateur inscrit,
**je veux** me connecter avec mon email et mot de passe,
**afin de** gerer mes demandes d'avis en toute securite.

**Criteres d'acceptation :**
- [x] L'utilisateur saisit email + mot de passe sur `/login`
- [x] Verification email obligatoire avant connexion
- [x] Si email non verifie, redirection vers `/check-email`
- [x] La session est persistee via JWT (7 jours)
- [x] Rate limiting : 5 tentatives/15min par email
- [x] Protection anti-bot : honeypot sur le formulaire
- [x] Comparaison timing-safe des mots de passe (anti-enumeration)

**Notes techniques :** NextAuth v5 Credentials provider + bcrypt + JWT

---

### US03 - Reinitialiser mon mot de passe `P1` `DONE`

**En tant que** utilisateur,
**je veux** pouvoir demander un lien de reinitialisation de mot de passe,
**afin de** recuperer l'acces a mon compte.

**Criteres d'acceptation :**
- [x] L'utilisateur demande un reset depuis `/forgot-password`
- [x] Un email avec un lien est envoye (valide 1 heure)
- [x] Le token est hashe (SHA-256) en base
- [x] Le nouveau mot de passe respecte les memes regles de validation
- [x] Rate limiting : 3 tentatives/heure par email

---

### US03b - Verification email `P0` `DONE`

**En tant que** nouvel utilisateur,
**je veux** verifier mon email via un lien envoye automatiquement,
**afin de** activer mon compte en toute securite.

**Criteres d'acceptation :**
- [x] Un email de verification est envoye apres l'inscription
- [x] Le lien est valide 24 heures, token hashe en base
- [x] Page `/check-email` avec possibilite de renvoyer le lien
- [x] Page `/verify-email` confirme la verification et redirige vers login
- [x] Rate limiting : 3 renvois/15min par email
- [x] Impossible de se connecter sans email verifie

---

### US04 - Me deconnecter `P0` `DONE`

**En tant que** utilisateur connecte,
**je veux** me deconnecter de mon espace,
**afin de** securiser mon acces, notamment sur un appareil partage.

**Criteres d'acceptation :**
- [x] Un bouton "Deconnexion" est visible dans la sidebar du dashboard
- [x] Le clic detruit la session cote serveur et supprime le cookie
- [x] L'utilisateur est redirige vers la page d'accueil `/`
- [x] Toute tentative d'acceder au dashboard redirige vers `/login`

---

## 2. Onboarding etablissement

### US05 - Creer mon etablissement `P0` `DONE`

**En tant que** professionnel,
**je veux** renseigner le nom de mon etablissement lors de ma premiere connexion,
**afin de** personnaliser les messages envoyes a mes clients/patients.

**Criteres d'acceptation :**
- [x] Une modale d'onboarding s'affiche au premier acces au dashboard
- [x] L'utilisateur peut saisir le nom de son etablissement
- [x] Le nom est sauvegarde en base (champ `businessName` du modele `User`)
- [x] Le nom apparait dans la sidebar et dans les messages envoyes
- [x] L'onboarding est marque comme complete (`onboarded = true`)

---

### US06 - Choisir ma niche `P0` `DONE`

**En tant que** professionnel,
**je veux** selectionner mon metier parmi les niches disponibles,
**afin de** beneficier de templates, vocabulaire et configuration adaptes a mon activite.

**Criteres d'acceptation :**
- [x] Niches : Dentiste, Osteopathe, Garage automobile, Autre (avec saisie libre)
- [x] La selection est enregistree dans le champ `niche` du profil
- [x] La niche determine les templates, le vocabulaire et les delais par defaut
- [x] La niche peut etre choisie a l'inscription puis modifiee dans les parametres

---

### US07 - Configurer mon lien d'avis Google `P0` `DONE`

**En tant que** professionnel,
**je veux** ajouter mon lien Google Review lors de l'onboarding,
**afin de** rediriger mes clients satisfaits directement vers la bonne fiche Google.

**Criteres d'acceptation :**
- [x] Un champ permet de coller l'URL de la fiche Google
- [x] Conversion automatique de tout format Google Maps vers URL writereview
- [x] Detection et validation du lien (badge vert si lien valide)
- [x] Le lien est utilise dans le parcours client (page `/review/[token]`)

---

### US08 - Definir mes coordonnees d'envoi `P1` `DONE`

**En tant que** professionnel,
**je veux** configurer les informations d'envoi (nom expediteur, email de reponse, telephone),
**afin de** envoyer des messages au nom de mon etablissement.

**Criteres d'acceptation :**
- [x] L'utilisateur peut definir un nom d'expediteur (email)
- [x] L'utilisateur peut definir un email de reponse (reply-to)
- [x] L'utilisateur peut configurer son telephone (SMS)
- [x] Les champs sont conditionnels : Email → nom + reply-to, SMS → telephone
- [x] Les placeholders s'adaptent au metier (ex: "Garage Dupont" pour un garage)
- [x] Sanitisation des headers email (anti-injection)

---

## 3. Gestion des contacts

### US09 - Ajouter un contact manuellement `P0` `DONE`

**En tant que** utilisateur,
**je veux** ajouter un client/patient manuellement via un formulaire,
**afin de** pouvoir lui envoyer une demande d'avis.

**Criteres d'acceptation :**
- [x] Formulaire : nom (obligatoire), email, telephone, notes
- [x] Au moins un moyen de contact (email ou telephone) requis
- [x] Validation des formats (email valide, telephone)
- [x] Le contact est associe a l'utilisateur connecte

---

### US10 - Importer des contacts par CSV `P1` `DONE`

**En tant que** utilisateur,
**je veux** importer une liste de contacts via un fichier CSV ou Excel,
**afin de** gagner du temps lors de la mise en place initiale.

**Criteres d'acceptation :**
- [x] Bouton "Importer" disponible (plan Pro+)
- [x] Support CSV et Excel (.xlsx)
- [x] Drag & drop ou selection de fichier
- [x] Detection automatique des colonnes (20+ alias supportes)
- [x] Apercu des donnees avant validation
- [x] Rapport d'import (X importes, Y ignores, Z erreurs avec details)
- [x] Protection anti-injection CSV (formules Excel bloquees)
- [x] Limites : Pro = 100 lignes, Business = 5 000 lignes

---

### US11 - Voir la liste de mes contacts `P0` `DONE`

**En tant que** utilisateur,
**je veux** consulter la liste de mes contacts avec leurs informations,
**afin de** retrouver facilement les personnes a solliciter.

**Criteres d'acceptation :**
- [x] La liste affiche : nom, email, telephone, nombre de demandes, date d'ajout
- [x] Colonnes responsives (certaines masquees sur mobile)
- [x] Message d'aide si la liste est vide
- [x] Vocabulaire adapte au metier (patients/clients)

---

### US12 - Modifier un contact `P1` `DONE`

**En tant que** utilisateur,
**je veux** corriger les informations d'un contact existant,
**afin de** eviter les erreurs d'envoi.

**Criteres d'acceptation :**
- [x] Bouton "Modifier" sur chaque ligne de contact
- [x] Formulaire pre-rempli avec les donnees actuelles
- [x] Memes validations que l'ajout
- [x] Verification de propriete (l'utilisateur ne peut modifier que ses contacts)

---

### US13 - Supprimer un contact `P0` `DONE`

**En tant que** utilisateur,
**je veux** supprimer un contact de ma liste,
**afin de** garder ma base propre et a jour.

**Criteres d'acceptation :**
- [x] Bouton de suppression sur chaque ligne
- [x] Confirmation avant suppression
- [x] Verification de propriete

---

## 4. Templates et personnalisation

### US14 - Utiliser un template de message par niche `P0` `DONE`

**En tant que** utilisateur,
**je veux** disposer d'un modele de message adapte a mon metier,
**afin de** lancer rapidement mes premieres demandes d'avis.

**Criteres d'acceptation :**
- [x] Chaque niche dispose d'un template SMS et email par defaut
- [x] Le template utilise le vocabulaire du metier
- [x] Variables dynamiques : `{{clientName}}`, `{{businessName}}`, `{{link}}`
- [x] 3 presets par canal et par niche : Formel, Amical, Relance

---

### US15 - Personnaliser mon message SMS `P1` `DONE`

**En tant que** utilisateur,
**je veux** modifier le contenu du SMS envoye a mes clients,
**afin de** l'adapter au ton de mon etablissement.

**Criteres d'acceptation :**
- [x] Editeur de texte pour le template SMS (plan Pro+)
- [x] Compteur de caracteres en temps reel (alerte > 160)
- [x] Variables inserables en un clic
- [x] Presets disponibles (Formel, Amical, Relance)
- [x] Possibilite de definir un template par defaut
- [x] Sauvegarde par utilisateur

---

### US16 - Personnaliser mon email `P1` `DONE`

**En tant que** utilisateur,
**je veux** modifier le contenu de l'email envoye a mes clients,
**afin de** communiquer de facon personnalisee et professionnelle.

**Criteres d'acceptation :**
- [x] Editeur pour le sujet et le corps de l'email (plan Pro+)
- [x] Variables dynamiques supportees
- [x] Presets disponibles
- [x] Possibilite de definir un template par defaut
- [x] Templates resanitises a chaque envoi (defense in depth)

---

### US17 - Utiliser des variables dynamiques `P0` `DONE`

**En tant que** utilisateur,
**je veux** que les messages inserent automatiquement le nom du client, de l'etablissement, etc.,
**afin de** rendre chaque message personnel et engageant.

**Criteres d'acceptation :**
- [x] Variables : `{{clientName}}`, `{{businessName}}`, `{{link}}`
- [x] Remplacement a l'envoi avec echappement HTML (anti-XSS)
- [x] Variables documentees dans l'editeur de templates

---

## 5. Envoi des demandes d'avis

### US18 - Envoyer une demande d'avis manuellement `P0` `DONE`

**En tant que** utilisateur,
**je veux** envoyer une demande d'avis a un contact en un clic,
**afin de** solliciter un retour apres une prestation.

**Criteres d'acceptation :**
- [x] Boutons "Email" et "SMS" sur chaque ligne de contact
- [x] Token unique cryptographique genere (32 bytes)
- [x] Quota verifie et decremente dans une transaction atomique (anti race condition)
- [x] Verification de propriete du client (anti IDOR)
- [x] Message de confirmation apres envoi
- [x] Envoi refuse si quota atteint

---

### US19 - Programmer un envoi avec delai `P2` `DONE`

**En tant que** utilisateur,
**je veux** definir un delai avant l'envoi de la demande,
**afin de** envoyer au moment optimal sans intervention manuelle.

**Criteres d'acceptation :**
- [x] Delai configurable dans les parametres (0 a 720 heures)
- [x] Delai par defaut adapte au metier (dentiste 2h, osteo 3h, garage 24h)
- [x] Cron job traite les envois en attente (`/api/cron/send-reviews`)
- [x] Envoi immediat si delai = 0

---

### US20 - Choisir le canal d'envoi `P0` `DONE`

**En tant que** utilisateur,
**je veux** choisir entre SMS et email pour chaque envoi,
**afin de** m'adapter aux coordonnees de mes clients.

**Criteres d'acceptation :**
- [x] Canaux proposes selon les coordonnees du contact
- [x] SMS disponible uniquement pour le plan Pro+
- [x] Le canal utilise est enregistre sur la demande

---

### US21 - Previsualiser le message avant envoi `P1` `DONE`

**En tant que** utilisateur,
**je veux** voir un apercu du message final avant de l'envoyer,
**afin de** verifier le contenu et eviter les erreurs.

**Criteres d'acceptation :**
- [x] Bouton "Apercu" sur chaque ligne de contact
- [x] Modale avec rendu email (iframe sandboxee) ou SMS (texte brut)
- [x] Variables remplacees par les vraies valeurs
- [x] Compteur de caracteres pour les SMS
- [x] Responsive et scrollable sur mobile

---

### US22 - Empecher les doublons d'envoi `P1` `DONE`

**En tant que** utilisateur,
**je veux** que le systeme m'empeche d'envoyer deux demandes au meme contact trop rapidement,
**afin de** ne pas harceler mes clients.

**Criteres d'acceptation :**
- [x] Delai minimum : 7 jours entre deux envois au meme contact
- [x] Verification dans la transaction atomique
- [x] Message d'erreur explicite si tentative trop rapprochee

---

## 6. Historique et suivi

### US23 - Consulter l'historique des envois `P0` `DONE`

**En tant que** utilisateur,
**je veux** voir la liste de tous les messages envoyes avec leur statut,
**afin de** suivre mon activite.

**Criteres d'acceptation :**
- [x] Page Campagnes avec toutes les demandes d'avis
- [x] Chaque entree : nom du contact, canal, date, statut, note, feedback
- [x] Statuts : En attente, Envoye, Clique, Avis obtenu, Feedback, Echoue
- [x] Trie par date (plus recent en premier), limite 200

---

### US24 - Voir le statut d'un envoi `P0` `DONE`

**En tant que** utilisateur,
**je veux** connaitre le statut de chaque demande d'avis,
**afin de** mesurer l'efficacite de mes envois.

**Criteres d'acceptation :**
- [x] Badge colore par statut
- [x] Mise a jour automatique (SENT → CLICKED → REVIEWED/FEEDBACK)

---

### US25 - Filtrer les envois `P2` `DONE`

**En tant que** utilisateur,
**je veux** filtrer mes envois par date, statut ou canal,
**afin de** analyser mes resultats.

**Criteres d'acceptation :**
- [x] Filtres : periode (7j, 30j, 90j), statut, canal (SMS/email)
- [x] Filtres combinables
- [x] Nombre de resultats affiche

---

## 7. Dashboard et statistiques

### US26 - Voir le nombre de demandes envoyees `P0` `DONE`

**En tant que** utilisateur,
**je veux** voir combien de demandes d'avis ont ete envoyees et mon quota restant,
**afin de** mesurer mon usage.

**Criteres d'acceptation :**
- [x] Compteur `quotaUsed / monthlyQuota` dans la sidebar
- [x] Carte "Envois" dans le dashboard

---

### US27 - Voir le nombre de clics `P0` `DONE`

**Criteres d'acceptation :**
- [x] Nombre de clics affiche dans le dashboard
- [x] Un clic = acces a la page `/review/[token]`

---

### US28 - Voir le taux de clic `P0` `DONE`

**Criteres d'acceptation :**
- [x] Taux de clic = `(clics / envois) * 100`
- [x] Affiche en pourcentage dans le dashboard

---

### US29 - Voir mes performances sur une periode `P2` `PLANNED`

**Criteres d'acceptation :**
- [ ] Selecteur de periode (7j, 30j, 90j)
- [ ] Graphique d'evolution (line chart ou bar chart)

---

## 8. Parametrage metier / niche

### US30 - Charger automatiquement une configuration selon la niche `P0` `DONE`

**Criteres d'acceptation :**
- [x] Configuration par niche : label, templates, vocabulaire, delai, presets
- [x] Defini dans `src/config/niches.ts`
- [x] 4 niches : DENTIST, OSTEOPATH, GARAGE, OTHER

---

### US31 - Utiliser le vocabulaire metier adapte `P1` `DONE`

**En tant que** utilisateur,
**je veux** voir des termes adaptes a ma profession dans toute l'interface,
**afin de** me sentir dans un outil concu pour mon activite.

**Criteres d'acceptation :**
- [x] Dentiste/Osteopathe : "patient", "cabinet"
- [x] Garage : "client", "garage"
- [x] Autre : "client", "etablissement"
- [x] Labels dynamiques dans : dashboard, formulaires, parametres, placeholders
- [x] Vocabulaire defini dans la configuration de chaque niche

---

### US32 - Modifier les reglages par defaut `P2` `DONE`

**Criteres d'acceptation :**
- [x] Modifiable dans la page Parametres : delai, canal, templates, seuil de satisfaction
- [x] Nom d'expediteur et adresse de reponse configurables
- [x] Telephone configurable pour les SMS

---

## 9. Abonnement et paiement

### US33 - Choisir une offre `P0` `DONE`

**Criteres d'acceptation :**
- [x] Plans dynamiques charges depuis la base de donnees
- [x] Comparatif sur la page d'accueil et a l'inscription
- [x] Essai gratuit sans carte bancaire
- [x] Page Facturation avec plan actuel et usage

---

### US34 - Payer mon abonnement `P0` `DONE`

**Criteres d'acceptation :**
- [x] Integration Stripe Checkout
- [x] Webhook `checkout.session.completed` active le plan
- [x] Webhook `invoice.paid` reinitialise le quota mensuel
- [x] Webhook `customer.subscription.deleted` retour au plan gratuit

---

### US35 - Consulter ma facturation `P2` `DONE`

**Criteres d'acceptation :**
- [x] Liste des 10 dernieres factures avec telechargement PDF
- [x] Affichage du plan actuel, quota, essai en cours
- [x] Barre de progression du quota

---

### US36 - Resilier mon abonnement `P1` `DONE`

**Criteres d'acceptation :**
- [x] Bouton "Annuler" sur la page Facturation
- [x] Confirmation requise avant annulation
- [x] L'abonnement reste actif jusqu'a la fin de la periode
- [x] Notification admin par email
- [x] Dates `cancelRequestedAt` et `cancelEffectiveAt` enregistrees

---

## 10. Administration interne

### US37 - Gerer les niches disponibles `P2` `DONE`

**Criteres d'acceptation :**
- [x] Fichier de configuration centralise (`src/config/niches.ts`)
- [x] Ajouter une niche ne necessite aucune modification du code metier
- [x] Niche "Autre" avec saisie libre du metier

---

### US38 - Gerer les templates par defaut `P2` `DONE`

**Criteres d'acceptation :**
- [x] Chaque niche a un template SMS et email par defaut
- [x] 3 presets par canal (Formel, Amical, Relance)
- [x] Templates supportent les variables dynamiques

---

### US39 - Suivre les etablissements inscrits `P2` `PLANNED`

**Criteres d'acceptation :**
- [ ] Liste des comptes avec metriques
- [ ] Filtres par niche, plan, activite
- [ ] Export CSV

---

### US40 - Desactiver un compte `P3` `DONE`

**Criteres d'acceptation :**
- [x] Champ `isSuspended` en base
- [x] Un compte suspendu ne peut plus acceder au dashboard
- [x] Page `/suspended` affichee

---

## 11. Parcours client (page d'avis)

### US41 - Acceder a la page de satisfaction `P0` `DONE`

**Criteres d'acceptation :**
- [x] Page accessible via `/review/[token]`
- [x] Le statut passe de SENT a CLICKED a l'ouverture
- [x] Affiche le nom de l'etablissement et une question de satisfaction (5 etoiles)
- [x] Token invalide → page 404
- [x] Rate limiting sur la soumission (10/h par IP)

---

### US42 - Etre redirige selon ma satisfaction `P0` `DONE`

**Criteres d'acceptation :**
- [x] 4-5 etoiles → redirection vers Google Review
- [x] 1-3 etoiles → formulaire de feedback prive (2000 chars max)
- [x] Seuil configurable par l'utilisateur (1-5, defaut 4)
- [x] Feedback enregistre en base (statut FEEDBACK)
- [x] Double soumission impossible
- [x] Parcours mobile-friendly (touch targets 44px+)

---

## 12. Securite et conformite

### US43 - Protection contre les attaques courantes `P0` `DONE`

**En tant que** editeur de la plateforme,
**je veux** que l'application soit protegee contre les attaques courantes,
**afin de** garantir la securite des donnees des utilisateurs.

**Criteres d'acceptation :**
- [x] Rate limiting sur tous les endpoints sensibles
- [x] Sanitisation HTML des templates (SVG, style, script, etc.)
- [x] Protection IDOR : verification de propriete sur toutes les actions
- [x] Transaction atomique sur le quota (anti race condition)
- [x] Protection anti-injection CSV (formules Excel)
- [x] Sanitisation des headers email (anti-injection)
- [x] Headers securite : HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- [x] `X-Powered-By` desactive (anti-fingerprinting)
- [x] `Referrer-Policy: no-referrer` sur `/review/*` (anti-fuite de token)
- [x] `robots.txt` bloquant les pages sensibles
- [x] Honeypot anti-bot sur login et register

---

### US44 - Page vitrine et SEO `P1` `DONE`

**En tant que** editeur de la plateforme,
**je veux** une page d'accueil professionnelle et optimisee,
**afin de** convertir les visiteurs en utilisateurs.

**Criteres d'acceptation :**
- [x] Hero avec demo animee (PhoneDemo)
- [x] Barre de stats sociales (professionnels, demandes, satisfaction)
- [x] Section probleme/solution
- [x] Timeline "Comment ca marche"
- [x] Section metiers avec tags
- [x] Filtre intelligent (satisfaction gate)
- [x] Section Avant/Apres avec chiffres concrets
- [x] Temoignages enrichis (etoiles, resultats, badge verifie)
- [x] Tarifs dynamiques depuis la base
- [x] CTA final
- [x] Navigation mobile (hamburger menu)
- [x] Footer avec badges confiance et FAQ

---

## Resume par priorite

| Priorite | Total | Done | In Progress | Todo | Planned |
|----------|-------|------|-------------|------|---------|
| P0 | 22 | 22 | 0 | 0 | 0 |
| P1 | 12 | 12 | 0 | 0 | 0 |
| P2 | 9 | 8 | 0 | 0 | 1 |
| P3 | 1 | 1 | 0 | 0 | 0 |
| **Total** | **44** | **43** | **0** | **0** | **1** |

> La seule US restante est US29 (graphique d'evolution des stats) prevue pour une version future.
