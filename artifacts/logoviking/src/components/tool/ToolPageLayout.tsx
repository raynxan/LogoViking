import { ReactNode } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "./AdSlot";
import { RelatedTools } from "./RelatedTools";
import type { ToolDef } from "@/lib/tools";

interface ToolPageLayoutProps {
  tool: ToolDef;
  children: ReactNode;
  resultSlot?: ReactNode;
}

export function ToolPageLayout({ tool, children, resultSlot }: ToolPageLayoutProps) {
  const url = `https://logoviking.com/tools/${tool.slug}`;
  return (
    <>
      <Helmet>
        <title>{tool.seoTitle}</title>
        <meta name="description" content={tool.seoDesc} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={tool.seoTitle} />
        <meta property="og:description" content={tool.seoDesc} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content="https://logoviking.com/images/logoviking.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: tool.name,
            description: tool.longDesc,
            url,
            applicationCategory: "MultimediaApplication",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          })}
        </script>
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-10">
        <nav className="flex items-center text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground truncate">{tool.name}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <tool.icon className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="text-xs font-normal">{tool.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{tool.name}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{tool.longDesc}</p>
        </header>

        <AdSlot position="top" />

        <div className="space-y-6">{children}</div>

        {resultSlot && (
          <>
            <AdSlot position="mid" />
            {resultSlot}
          </>
        )}

        <RelatedTools slugs={tool.related} />

        <AdSlot position="bottom" />
      </div>
    </>
  );
}
