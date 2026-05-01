import { Link, useRoute } from "wouter";
import { Helmet } from "react-helmet-async";
import { useGetBlogPost, useListBlogPosts, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const { data: post, isLoading } = useGetBlogPost(slug, { query: { queryKey: getGetBlogPostQueryKey(slug), enabled: !!slug } });
  const { data: list } = useListBlogPosts();

  if (isLoading) return <div className="container max-w-3xl mx-auto px-4 py-16 text-muted-foreground">Loading…</div>;
  if (!post) return <div className="container max-w-3xl mx-auto px-4 py-16">Post not found.</div>;

  const others = (list?.items ?? []).filter(p => p.slug !== slug).slice(0, 3);
  const url = `https://logoviking.com/blog/${post.slug}`;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <Helmet>
        <title>{post.title} — Logoviking</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            url,
            articleSection: post.category,
          })}
        </script>
      </Helmet>

      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/blog"><ArrowLeft className="h-4 w-4 mr-1" /> Back to blog</Link>
      </Button>

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-xs">
          <Badge variant="outline">{post.category}</Badge>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{post.readingTime} min read</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">{post.title}</h1>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-primary" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      {others.length > 0 && (
        <section className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-semibold mb-4">Read next</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {others.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`}>
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <Badge variant="outline" className="self-start text-xs mb-2">{p.category}</Badge>
                    <CardTitle className="text-base line-clamp-2">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-xs text-muted-foreground line-clamp-2">{p.excerpt}</p></CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
