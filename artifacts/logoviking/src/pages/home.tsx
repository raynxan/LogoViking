import { Link } from "wouter";
import { TOOLS } from "@/lib/tools";
import { useListBlogPosts } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { 
  Image as FileImage, 
  Wand2, 
  Video, 
  TrendingUp, 
  Search, 
  Zap,
  ArrowRight,
  ShieldCheck,
  Zap as ZapFast,
  Lock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FEATURED_TOOLS = ["youtube-earnings", "hashtag-generator", "thumbnail-downloader", "ai-thumbnail-generator", "meta-tag-generator", "creator-kit"];

export default function Home() {
  const { data: blogPosts } = useListBlogPosts();
  const featuredTools = TOOLS.filter(t => FEATURED_TOOLS.includes(t.slug));

  const categories = [
    { name: "Image Tools", icon: FileImage, count: TOOLS.filter(t => t.category === "IMAGE TOOLS").length },
    { name: "Smart Image", icon: Wand2, count: TOOLS.filter(t => t.category === "SMART/AI IMAGE TOOLS").length },
    { name: "Creator", icon: Video, count: TOOLS.filter(t => t.category === "CREATOR TOOLS").length },
    { name: "Viral", icon: TrendingUp, count: TOOLS.filter(t => t.category === "VIRAL GENERATORS").length },
    { name: "SEO", icon: Search, count: TOOLS.filter(t => t.category === "SEO TOOLS").length },
    { name: "All-in-one", icon: Zap, count: TOOLS.filter(t => t.category === "ALL-IN-ONE").length },
  ];

  return (
    <>
      <Helmet>
        <title>LogoViking — Viking-Grade Tools for Modern Creators</title>
        <meta name="description" content="26 free creator, image & SEO tools. No signup. No watermarks. No nonsense." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "LogoViking",
            "url": "https://logoviking.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://logoviking.com/tools?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary font-medium tracking-wide">
              NO SIGNUP REQUIRED
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-foreground">
              Viking-Grade Tools <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                for Modern Creators
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              26 free creator, image & SEO tools. No signup. No watermarks. No nonsense. Built for speed and privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/20" asChild>
                <Link href="/tools">
                  Browse all 26 tools
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>

            {/* Trust Strip */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground/80">
              <div className="flex items-center gap-2"><ZapFast className="h-4 w-4 text-primary" /> Free forever</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> No watermarks</div>
              <div className="flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Private, browser-side processing</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground">Six toolkits to supercharge your content creation workflow.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/tools" className="block">
                  <Card className="hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer h-full group text-center py-6">
                    <CardContent className="p-0 flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                        <cat.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="font-semibold">{cat.name}</div>
                      <div className="text-xs text-muted-foreground">{cat.count} tools</div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Tools</h2>
              <p className="text-muted-foreground">Our most popular tools right now.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex">
              <Link href="/tools">View all tools &rarr;</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool, i) => (
              <motion.div
                key={tool.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-primary/40 transition-colors group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-normal">
                        {tool.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{tool.name}</CardTitle>
                    <CardDescription className="text-sm mt-2">{tool.shortDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4">
                    <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                      <Link href={`/tools/${tool.slug}`}>Open Tool</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/tools">View all tools &rarr;</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
      {blogPosts && blogPosts.items && blogPosts.items.length > 0 && (
        <section className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Latest from the Blog</h2>
              <p className="text-muted-foreground">Tips, tricks, and guides for creators.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.items.slice(0, 3).map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full group">
                    <Card className="h-full hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                          <Badge variant="outline">{post.category}</Badge>
                          <span>•</span>
                          <span>{post.readingTime} min read</span>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Ready to create faster?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Stop paying for simple tools. Bookmark LogoViking and use all 26 tools completely free, forever.
          </p>
          <Button size="lg" className="h-14 px-10 text-lg shadow-xl shadow-primary/20" asChild>
            <Link href="/tools">Start Using Tools Now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
