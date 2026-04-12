# Valoravis - Guide utilisateur

## Sommaire

1. [Premiers pas](#1-premiers-pas)
2. [Tableau de bord](#2-tableau-de-bord)
3. [Établissements et équipe](#3-établissements-et-équipe)
4. [Gestion des clients](#4-gestion-des-clients)
5. [Envoyer une demande d'avis](#5-envoyer-une-demande-davis)
6. [Suivi des campagnes](#6-suivi-des-campagnes)
7. [Paramètres](#7-paramètres)
8. [Templates personnalisés](#8-templates-personnalisés)
9. [Abonnement et facturation](#9-abonnement-et-facturation)
10. [Comment ça marche côté client](#10-comment-ça-marche-côté-client)
11. [FAQ](#11-faq)

---

## 1. Premiers pas

### Créer un compte

1. Rendez-vous sur la page d'inscription
2. Sélectionnez votre métier (dentiste, ostéopathe, garage ou autre)
3. Renseignez votre email professionnel et un mot de passe
   - Minimum 8 caractères, 1 majuscule, 1 chiffre
4. Choisissez votre plan (Gratuit, Pro ou Business)
5. Un email de vérification vous est envoyé — cliquez sur le lien pour activer votre compte

### Onboarding

À la première connexion, un assistant vous guide :

1. **Nom de l'établissement** — le nom affiché dans les messages envoyés à vos clients
2. **Métier** — permet d'adapter le vocabulaire et les délais d'envoi
3. **Lien Google Maps** — collez l'URL de votre fiche Google pour que les clients satisfaits y laissent leur avis
4. **Téléphone** — utilisé si vous activez les SMS (plan Pro+)

> **Astuce** : Vous pouvez modifier toutes ces informations plus tard dans les paramètres.

---

## 2. Tableau de bord

Le tableau de bord affiche un résumé de l'activité de l'établissement sélectionné :

- **Nom de l'établissement** et métier en en-tête
- **Quota utilisé** : nombre d'envois ce mois / quota total (hérité du propriétaire)
- **Statut des demandes** : en attente, envoyées, cliquées, avis obtenus
- **Statistiques détaillées** (Pro) : envois email/SMS, taux de conversion
- **Graphique d'évolution** (Business) : courbe sur 7/30/90 jours
- Accès rapide aux clients et aux paramètres

> Les données affichées correspondent à l'établissement actif. Changez d'établissement via le sélecteur dans la barre latérale.

---

## 3. Établissements et équipe

### Concept

Un établissement représente un lieu physique (cabinet, garage, salon...). Chaque établissement a ses propres clients, campagnes, templates et paramètres.

### Limites par plan

| Plan | Établissements | Membres par établissement |
|------|---------------|--------------------------|
| Gratuit | 1 | 1 (solo) |
| Pro | 5 | 3 |
| Business | 50 | Illimité |

### Gérer vos établissements

Depuis **Établissements** dans le menu :

1. **Ajouter** un établissement (nom, métier, URL Google, téléphone)
2. **Sélectionner** l'établissement actif (toutes les pages s'adaptent)
3. **Supprimer** un établissement (sauf le dernier)

### Rôles et permissions

Chaque membre d'un établissement a un rôle :

| Action | Propriétaire | Admin | Membre |
|--------|-------------|-------|--------|
| Voir le tableau de bord et les stats | Oui | Oui | Oui |
| Voir et ajouter des clients | Oui | Oui | Oui |
| Envoyer des demandes d'avis | Oui | Oui | Oui |
| Modifier/supprimer des clients | Oui | Oui | Non |
| Import CSV | Oui | Oui | Non |
| Paramètres de l'établissement | Oui | Oui | Non |
| Gérer les templates | Oui | Oui | Non |
| Inviter des membres | Oui | Oui (rôle Membre uniquement) | Non |
| Changer le rôle d'un membre | Oui | Non | Non |
| Supprimer un établissement | Oui | Non | Non |
| Abonnement et facturation | Oui | Non | Non |

### Inviter un membre

1. Allez sur **Établissements**
2. Cliquez sur le compteur de membres d'un établissement
3. Cliquez **Inviter un membre**
4. Saisissez l'email et choisissez le rôle

**Si la personne n'a pas de compte** : elle reçoit un email avec un lien pour créer son compte. Son email est prérempli, elle n'a qu'à choisir un nom et un mot de passe. Son compte est automatiquement activé et rattaché à l'établissement.

**Si la personne a déjà un compte** : elle est ajoutée directement et reçoit une notification par email.

### Héritage du plan

Les membres invités héritent automatiquement du plan du propriétaire. Un membre avec un compte gratuit aura accès aux fonctionnalités Pro ou Business de l'établissement s'il appartient à un propriétaire qui a ce plan.

### Changer d'établissement

Utilisez le sélecteur en haut de la barre latérale pour basculer entre vos établissements. Toutes les pages (clients, campagnes, stats, paramètres) s'adaptent automatiquement.

---

## 4. Gestion des clients

### Ajouter un client manuellement

Depuis la page **Clients**, cliquez sur le formulaire d'ajout et renseignez :

- **Nom** (obligatoire)
- **Email** — nécessaire pour l'envoi par email
- **Téléphone** — nécessaire pour l'envoi par SMS
- **Notes** (optionnel) — pour vous, non visible par le client

### Importer des clients en masse (CSV)

> Disponible à partir du plan **Pro**.

1. Cliquez sur **Importer**
2. Glissez-déposez un fichier CSV ou Excel (.xlsx)
3. Les colonnes sont détectées automatiquement : nom, email, téléphone, notes
4. Vérifiez l'aperçu et corrigez les éventuelles erreurs
5. Confirmez l'import

**Limites d'import** :
| Plan | Lignes max par fichier |
|------|----------------------|
| Pro | 100 |
| Business | 5 000 |

### Modifier ou supprimer un client

Depuis la liste des clients, utilisez les boutons d'action à droite de chaque ligne pour modifier les informations ou supprimer un client.

---

## 5. Envoyer une demande d'avis

### Envoi individuel

1. Depuis la page **Clients**, repérez le client souhaité
2. Cliquez sur **Email** ou **SMS** (si disponible dans votre plan)
3. La demande est envoyée avec le délai configuré dans vos paramètres

### Délai d'envoi

Le délai représente le temps entre le moment où vous cliquez et l'envoi effectif du message. Par défaut, il est adapté à votre métier :

| Métier | Délai recommandé |
|--------|-----------------|
| Dentiste | 2 heures |
| Ostéopathe | 3 heures |
| Garage | 24 heures |
| Autre | 4 heures |

Vous pouvez le personnaliser dans **Paramètres > Préférences d'envoi** (0 à 720 heures).

### Protections anti-spam

- Un même client ne peut pas recevoir plus d'une demande sur une période de 7 jours
- Votre quota mensuel est vérifié avant chaque envoi

---

## 6. Suivi des campagnes

La page **Campagnes** vous permet de suivre toutes vos demandes d'avis :

### Statuts

| Statut | Signification |
|--------|--------------|
| En attente | Programmée, pas encore envoyée |
| Envoyée | Le message a été envoyé |
| Cliquée | Le client a ouvert le lien |
| Avis obtenu | Le client a noté >= seuil et a été redirigé vers Google |
| Feedback | Le client a noté < seuil et a laissé un retour privé |
| Échouée | L'envoi a échoué (email invalide, etc.) |

### Filtres disponibles

- **Canal** : Email ou SMS
- **Statut** : tous les statuts ci-dessus
- **Période** : 7, 30 ou 90 derniers jours

---

## 7. Paramètres

### Établissement

- Nom de l'établissement
- Métier (adapte les templates et le vocabulaire)
- URL Google Maps (lien vers votre fiche d'avis)
- Téléphone

### Préférences d'envoi

**Mode Email** :
- Nom de l'expéditeur — affiché dans la boîte de réception du client
- Adresse de réponse — si le client répond à l'email

**Mode SMS** :
- Numéro de téléphone de l'établissement

**Commun** :
- Délai avant envoi (en heures)

### Seuil de satisfaction

Le seuil détermine à partir de quelle note un client est redirigé vers Google :

- **4 étoiles** (par défaut) : seuls les 4 et 5 étoiles vont sur Google
- **3 étoiles** : les 3, 4 et 5 étoiles vont sur Google
- Les notes en dessous du seuil affichent un formulaire de feedback privé

---

## 8. Templates personnalisés

> Disponible à partir du plan **Pro**.

### Variables disponibles

| Variable | Remplacée par |
|----------|--------------|
| `{{clientName}}` | Le prénom/nom du client |
| `{{businessName}}` | Le nom de votre établissement |
| `{{link}}` | Le lien de notation unique |

### Templates email

- **Objet** : le sujet de l'email
- **Corps** : contenu HTML de l'email
- Presets disponibles : Formel, Amical, Relance

### Templates SMS

- **Corps** : texte brut (160 caractères recommandés)
- Indicateur de longueur en temps réel
- Presets disponibles : Formel, Amical, Relance

### Gestion

- Créez plusieurs templates par canal
- Définissez un template par défaut (utilisé pour les envois automatiques)
- Testez vos templates en vous envoyant un message de test

---

## 9. Abonnement et facturation

### Plans disponibles

| | Gratuit | Pro | Business |
|--|---------|-----|----------|
| Envois/mois | 50 | 200 | 500 |
| Établissements | 1 | 5 | 50 |
| Membres/établissement | 1 | 3 | Illimité |
| Email | Oui | Oui | Oui |
| SMS | Non | Oui | Oui |
| Templates personnalisés | Non | Oui | Oui |
| Import CSV | Non | 100 lignes | 5 000 lignes |
| Statistiques détaillées | Non | Oui | Oui |
| Statistiques avancées | Non | Non | Oui |
| Support prioritaire | Non | Non | Oui |

### Essai gratuit

Les plans payants proposent un essai gratuit (durée variable selon le plan). Aucune carte bancaire n'est requise pour démarrer.

### Annulation

Vous pouvez annuler votre abonnement à tout moment depuis **Facturation > Annuler**. L'annulation prend effet à la fin de la période en cours.

### Factures

Vos 10 dernières factures sont disponibles en téléchargement PDF depuis la page **Facturation**.

---

## 10. Comment ça marche côté client

Voici ce que vit votre client après l'envoi d'une demande :

1. **Il reçoit un email ou SMS** avec un message personnalisé et un lien
2. **Il clique sur le lien** et arrive sur une page de notation simple
3. **Il note son expérience** de 1 à 5 étoiles
4. **Si la note est >= votre seuil** (ex: 4 ou 5 étoiles) :
   - Il est redirigé vers votre fiche Google Maps pour publier son avis
5. **Si la note est < votre seuil** (ex: 1, 2 ou 3 étoiles) :
   - Un formulaire de feedback s'affiche
   - Son retour vous est envoyé en privé
   - Rien n'est publié sur Google

> C'est le "filtre intelligent" de Valoravis : les avis positifs vont sur Google, les retours négatifs restent entre vous et votre client.

---

## 11. FAQ

### Est-ce conforme aux règles Google ?
Oui. Valoravis envoie un lien vers la page Google standard. Le client choisit librement de laisser un avis ou non.

### Mes clients recevront-ils du spam ?
Non. Un même client ne peut recevoir qu'une seule demande tous les 7 jours. De plus, votre quota mensuel limite le nombre total d'envois.

### Puis-je utiliser Valoravis avec plusieurs établissements ?
Oui. Le plan Gratuit inclut 1 établissement, le plan Pro jusqu'à 5, et le plan Business jusqu'à 50. Chaque établissement a ses propres clients, campagnes et paramètres. Vous pouvez basculer entre vos établissements via le sélecteur dans la barre latérale.

### Puis-je inviter des collaborateurs ?
Oui. Depuis la page Établissements, invitez des membres par email. Ils recevront un lien pour créer leur compte (ou sont ajoutés directement s'ils ont déjà un compte). Vous choisissez leur rôle : Admin (gestion complète) ou Membre (consultation et envoi).

### Les membres invités doivent-ils payer ?
Non. Les membres héritent du plan du propriétaire de l'établissement. Ils n'ont pas besoin de leur propre abonnement.

### Que se passe-t-il si je dépasse mon quota ?
Les envois sont bloqués jusqu'au renouvellement mensuel. Passez au plan supérieur pour augmenter votre quota.

### Comment récupérer mon mot de passe ?
Cliquez sur "Mot de passe oublié" sur la page de connexion. Un lien de réinitialisation vous sera envoyé par email (valide 1 heure).

### Mes données sont-elles sécurisées ?
Oui. Les mots de passe sont chiffrés (bcrypt), les connexions sont en HTTPS, et les données sont hébergées en Europe (Supabase, région EU).
