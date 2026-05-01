import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

export function LegalLayout({ title, slug, children }: { title: string; slug: string; children: ReactNode }) {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-16">
      <Helmet>
        <title>{title} — Logoviking</title>
        <link rel="canonical" href={`https://logoviking.com/${slug}`} />
      </Helmet>
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>{title}</h1>
        <p className="text-sm text-muted-foreground"><em>Last updated: January 2026</em></p>
        {children}
      </article>
    </div>
  );
}
