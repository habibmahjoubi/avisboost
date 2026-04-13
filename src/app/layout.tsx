import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Valoravis - Collectez vos avis Google automatiquement",
    template: "%s | Valoravis",
  },
  description:
    "Valoravis envoie automatiquement un SMS ou email après chaque prestation pour collecter des avis Google. Filtre intelligent : avis positifs sur Google, négatifs en privé. Pour garages, coiffeurs, restaurants, ostéopathes, dentistes.",
  keywords: [
    "avis Google",
    "collecte avis automatique",
    "avis Google garage",
    "avis Google restaurant",
    "avis Google coiffeur",
    "avis Google dentiste",
    "avis Google ostéopathe",
    "gestion avis clients",
    "e-réputation",
    "avis positifs Google",
    "demande avis SMS",
    "logiciel avis Google",
    "note Google Maps",
    "améliorer note Google",
  ],
  metadataBase: new URL("https://valoravis.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://valoravis.fr",
    siteName: "Valoravis",
    title: "Valoravis - Collectez vos avis Google automatiquement",
    description:
      "Vos clients sont satisfaits mais ne laissent pas d'avis Google ? Valoravis envoie un SMS ou email automatique après chaque prestation. Avis positifs sur Google, négatifs en privé.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Valoravis - Avis Google automatiques pour commerçants et artisans",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Valoravis - Collectez vos avis Google automatiquement",
    description:
      "SMS ou email automatique après chaque prestation. Avis positifs sur Google, négatifs en privé. Gratuit pour démarrer.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh w-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Valoravis",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://valoravis.fr",
              description:
                "Collecte automatique d'avis Google pour les commerçants et artisans. SMS ou email après chaque prestation, filtre intelligent.",
              offers: [
                {
                  "@type": "Offer",
                  name: "Gratuit",
                  price: "0",
                  priceCurrency: "EUR",
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "4.99",
                  priceCurrency: "EUR",
                  billingPeriod: "P1M",
                },
                {
                  "@type": "Offer",
                  name: "Business",
                  price: "14.99",
                  priceCurrency: "EUR",
                  billingPeriod: "P1M",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "12",
              },
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
