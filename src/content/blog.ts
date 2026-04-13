export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  keywords: string[];
  sections: {
    title: string;
    content: string;
  }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "comment-obtenir-plus-avis-google",
    title: "Comment obtenir plus d'avis Google pour votre commerce en 2026",
    description:
      "Découvrez les stratégies concrètes pour multiplier vos avis Google : timing, canaux, automatisation. Guide complet pour commerçants et artisans.",
    date: "2026-04-13",
    readTime: "5 min",
    category: "Guide",
    keywords: [
      "avis Google",
      "obtenir avis Google",
      "plus avis Google commerce",
      "collecter avis clients",
    ],
    sections: [
      {
        title: "Pourquoi les avis Google sont essentiels",
        content: `93% des consommateurs lisent les avis en ligne avant de choisir un commerce local. Votre note Google est souvent le premier contact entre vous et un futur client.

Pourtant, la plupart des commerçants et artisans font face au même paradoxe : des dizaines de clients satisfaits chaque semaine, mais seulement quelques avis par an.

Le problème n'est jamais la qualité de votre travail. C'est le passage à l'acte.`,
      },
      {
        title: "Le timing est la clé",
        content: `La fenêtre idéale pour demander un avis se situe entre 1h et 24h après la prestation. Après 48h, le client a déjà oublié les détails positifs de son expérience.

Chaque métier a son timing optimal :
- **Dentiste** : 2h après la consultation (le patient est soulagé)
- **Ostéopathe** : 3h après la séance (les effets se font sentir)
- **Garage** : 24h après la récupération du véhicule (le client a pu tester)
- **Restaurant** : 2h après le repas
- **Coiffeur** : le soir même (les compliments arrivent)

Envoyer la demande au mauvais moment, c'est perdre 80% des réponses.`,
      },
      {
        title: "SMS ou email : quel canal choisir ?",
        content: `Le SMS a un taux d'ouverture de 98% contre 20% pour l'email. Mais l'email permet un message plus riche avec votre branding.

Notre recommandation :
- **SMS** pour les métiers de santé et services rapides (le patient a votre numéro)
- **Email** pour les commerces avec une relation plus formelle (garage, restaurant)
- **Les deux** si vous avez les coordonnées : SMS pour la notification, email en rappel

L'important est de rendre le processus aussi simple que possible : un lien, un clic, 5 étoiles.`,
      },
      {
        title: "Le filtre intelligent : protégez votre note",
        content: `La crainte numéro 1 des commerçants : "Et si je reçois un avis négatif ?"

La solution est le filtre de satisfaction. Avant d'envoyer le client sur Google, demandez-lui de noter son expérience :
- **4-5 étoiles** : le client est redirigé vers Google Maps pour publier
- **1-3 étoiles** : un formulaire de feedback privé s'affiche

Résultat : les avis positifs vont sur Google, les retours négatifs restent entre vous et votre client. Vous pouvez traiter le problème en direct, sans impact public.`,
      },
      {
        title: "Automatiser pour ne plus y penser",
        content: `Demander manuellement un avis à chaque client est irréaliste. Vous avez un métier à exercer.

L'automatisation résout le problème : vous ajoutez votre client, et le système s'occupe du reste. SMS ou email envoyé au bon moment, avec le bon message, adapté à votre métier.

Des outils comme Valoravis permettent de configurer tout ça en 2 minutes, avec un plan gratuit pour démarrer. Le retour sur investissement est immédiat : plus d'avis = plus de visibilité = plus de clients.`,
      },
    ],
  },
  {
    slug: "erreurs-note-google",
    title: "5 erreurs qui plombent votre note Google (et comment les éviter)",
    description:
      "Les erreurs les plus courantes qui empêchent les commerçants d'avoir une bonne note Google, et les solutions concrètes pour chacune.",
    date: "2026-04-13",
    readTime: "4 min",
    category: "Conseils",
    keywords: [
      "note Google",
      "améliorer note Google",
      "erreurs avis Google",
      "e-réputation commerce",
    ],
    sections: [
      {
        title: "Erreur 1 : Ne jamais demander",
        content: `C'est l'erreur la plus fréquente. 90% des commerçants attendent que les avis tombent tout seuls. Résultat : seuls les clients très satisfaits ou très mécontents s'expriment.

La solution : systématiser la demande. Chaque client qui passe chez vous devrait recevoir une sollicitation. Pas besoin de le faire en personne — un SMS automatique suffit.`,
      },
      {
        title: "Erreur 2 : Demander au mauvais moment",
        content: `Demander un avis 2 semaines après la prestation, c'est trop tard. Le client a oublié les détails, l'émotion positive est passée.

La fenêtre optimale est de 1h à 24h selon votre métier. Un SMS envoyé 2h après une consultation dentaire a 3 fois plus de chances d'aboutir qu'un email envoyé le lendemain.`,
      },
      {
        title: "Erreur 3 : Rendre le processus compliqué",
        content: `"Allez sur Google Maps, cherchez notre nom, cliquez sur Avis, puis Rédiger un avis..." — vous avez déjà perdu 95% des gens.

La solution : un lien direct. Le client clique, il arrive sur la page d'avis, il note. 10 secondes maximum. Chaque étape supplémentaire divise le taux de conversion par 2.`,
      },
      {
        title: "Erreur 4 : Ignorer les retours négatifs",
        content: `Un avis négatif sans réponse fait plus de dégâts que l'avis lui-même. 45% des consommateurs disent qu'ils sont plus enclins à visiter un commerce qui répond aux avis négatifs.

Répondez toujours, de manière professionnelle et constructive. Et mieux encore : interceptez les retours négatifs avant qu'ils arrivent sur Google grâce à un filtre de satisfaction.`,
      },
      {
        title: "Erreur 5 : Ne pas avoir de stratégie régulière",
        content: `Avoir 50 avis d'un coup puis plus rien pendant 6 mois, c'est suspect aux yeux de Google. L'algorithme favorise un flux régulier d'avis récents.

L'automatisation garantit cette régularité : chaque client génère potentiellement un avis, de manière naturelle et continue. C'est la clé d'une note Google qui monte — et qui reste haute.`,
      },
    ],
  },
  {
    slug: "pourquoi-clients-satisfaits-pas-avis",
    title: "Pourquoi vos clients satisfaits ne laissent pas d'avis Google",
    description:
      "Comprendre la psychologie derrière le silence de vos clients satisfaits et les leviers pour les encourager à s'exprimer sur Google.",
    date: "2026-04-13",
    readTime: "4 min",
    category: "Analyse",
    keywords: [
      "clients satisfaits",
      "pas d'avis Google",
      "psychologie avis",
      "encourager avis Google",
    ],
    sections: [
      {
        title: "Le biais de négativité",
        content: `Les études en psychologie sont claires : les expériences négatives ont un impact émotionnel 2 à 3 fois plus fort que les expériences positives. Un client mécontent ressent le besoin de s'exprimer. Un client satisfait considère que "tout est normal".

C'est pour ça qu'un garage avec 98% de clients satisfaits peut avoir une note de 3.8 sur Google : les 2% de mécontents sont surreprésentés.`,
      },
      {
        title: "La friction tue la motivation",
        content: `Même un client qui voudrait laisser un avis abandonne face à la complexité :
- Trouver la fiche Google
- Se connecter à son compte Google
- Rédiger un texte
- Choisir une note

Chaque étape élimine des gens. La solution : réduire le parcours au strict minimum. Un lien, un clic, une note. Le texte est optionnel.`,
      },
      {
        title: "L'absence de déclencheur",
        content: `Votre client quitte votre commerce satisfait. Il remonte dans sa voiture, consulte ses messages, reprend sa journée. À aucun moment il ne pense "je vais aller sur Google laisser un avis".

Il ne manque pas de volonté. Il manque un déclencheur. Un simple SMS reçu 2h après avec un lien direct fait toute la différence. C'est le coup de pouce qui transforme l'intention en action.`,
      },
      {
        title: "La preuve sociale inversée",
        content: `Quand un client voit que votre fiche Google a peu d'avis, il se dit "personne ne laisse d'avis ici, pourquoi je le ferais ?". C'est un cercle vicieux.

À l'inverse, une fiche avec beaucoup d'avis récents encourage les nouveaux clients à contribuer. Les premiers avis sont les plus difficiles à obtenir — ensuite l'effet boule de neige fait le travail.`,
      },
      {
        title: "La solution : demander au bon moment, de la bonne manière",
        content: `Combinez ces 3 éléments et vos avis exploseront :

1. **Le timing** — SMS ou email dans les heures qui suivent la prestation
2. **La simplicité** — un seul lien, notation en 1 clic
3. **Le filtre** — les clients satisfaits vont sur Google, les autres vous écrivent en privé

Les commerces qui automatisent ce processus voient en moyenne 3 fois plus d'avis Google dès le premier mois. Et leur note monte naturellement, parce que les clients satisfaits s'expriment enfin.`,
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
