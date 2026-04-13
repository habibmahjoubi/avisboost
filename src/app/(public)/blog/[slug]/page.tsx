import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/content/blog";
import { ArrowLeft, ArrowRight, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://valoravis.fr/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

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

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-16">
        {/* Breadcrumb */}
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au blog
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
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

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-8 sm:mb-12">
          {post.description}
        </p>

        {/* Content */}
        <article className="space-y-8">
          {post.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                {section.title}
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-3">
                {section.content.split("\n\n").map((paragraph, j) => (
                  <p
                    key={j}
                    dangerouslySetInnerHTML={{
                      __html: paragraph
                        .replace(
                          /\*\*(.+?)\*\*/g,
                          '<strong class="text-foreground">$1</strong>'
                        )
                        .replace(/\n- /g, "<br>- "),
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </article>

        {/* CTA in article */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6 sm:p-8 text-center">
          <h3 className="text-lg sm:text-xl font-bold mb-2">
            Automatisez votre collecte d&apos;avis Google
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Valoravis envoie un SMS ou email après chaque prestation. Les avis positifs vont sur Google, les négatifs restent privés.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90"
          >
            Essayer gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-12">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <Link href="/" className="font-bold text-foreground">
            Valor<span className="text-primary">avis</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/blog" className="hover:text-foreground">Blog</Link>
            <Link href="/register" className="hover:text-foreground">S&apos;inscrire</Link>
            <Link href="/login" className="hover:text-foreground">Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
