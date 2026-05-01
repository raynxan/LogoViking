import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BlogIndex() {
  const { data, isLoading } = useListBlogPosts();
  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Helmet>
        <title>Blog — Logoviking</title>
        <meta name="description" content="Tips, tutorials and deep-dives on creator tools, image optimization and SEO." />
        <link rel="canonical" href="https://logoviking.com/blog" />
      </Helmet>
      <header className="text-center mb-12 max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">The Logoviking Blog</h1>
        <p className="text-lg text-muted-foreground">Practical guides for creators, marketers and indie builders.</p>
      </header>
      {isLoading && <p className="text-center text-muted-foreground">Loading articles…</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.items.map(post => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Card className="h-full hover:border-primary/40 transition-colors group">
              <CardHeader>
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <Badge variant="outline">{post.category}</Badge>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{post.readingTime} min read</span>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p></CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
