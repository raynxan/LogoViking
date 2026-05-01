import { useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { TOOLS, ToolCategory } from "@/lib/tools";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ToolsHub() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ToolCategory | "ALL">("ALL");

  const categories = ["ALL", ...Array.from(new Set(TOOLS.map((t) => t.category)))];

  const filteredTools = TOOLS.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || tool.shortDesc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "ALL" || tool.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <Helmet>
        <title>All Creator Tools — Logoviking</title>
        <meta name="description" content="Browse all 26 free creator, image, and SEO tools on Logoviking." />
        <link rel="canonical" href="https://logoviking.com/tools" />
      </Helmet>

      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Creator Tools Hub</h1>
        <p className="text-lg text-muted-foreground mb-8">Everything you need to create, optimize, and grow.</p>
        
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search tools (e.g., 'compress', 'youtube', 'hashtag')..." 
            className="pl-10 h-12 text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="ALL" value={category} onValueChange={(v) => setCategory(v as any)} className="mb-8">
        <TabsList className="flex flex-wrap h-auto justify-center gap-2 bg-transparent">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool, i) => (
          <motion.div
            key={tool.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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

      {filteredTools.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No tools found matching your search.</p>
          <Button variant="link" onClick={() => { setSearch(""); setCategory("ALL"); }} className="mt-4">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
