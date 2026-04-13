import Link from "next/link";
import { BLOG_POSTS } from "@/content/blog";
import { ArrowRight, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Conseils avis Google pour commerçants",
  description:
    "Guides et conseils pour obtenir plus d'avis Google, améliorer votre e-réputation et attirer plus de clients. Pour garages, coiffeurs, restaurants, ostéopathes.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Valor<span className="text-primary">avis</span>
          </Link>
          <Link
            href="/register"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Essai gratuit
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-16">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3">
          Blog Valoravis
        </h1>
        <p className="text-muted-foreground mb-8 sm:mb-12 max-w-lg">
          Guides et conseils pour obtenir plus d&apos;avis Google et
          améliorer votre e-réputation.
        </p>

        <div className="space-y-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-card border border-border rounded-xl p-5 sm:p-8 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
                <span>{post.date}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {post.description}
              </p>
              <span className="text-sm text-primary font-medium flex items-center gap-1">
                Lire l&apos;article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Prêt à obtenir plus d&apos;avis Google ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Valoravis automatise la collecte d&apos;avis pour les commerçants et artisans. Gratuit pour démarrer.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90"
          >
            Créer mon compte gratuit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
