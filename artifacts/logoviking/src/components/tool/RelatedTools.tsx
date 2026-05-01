import { Link } from "wouter";
import { TOOLS } from "@/lib/tools";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export function RelatedTools({ slugs }: { slugs: string[] }) {
  const related = slugs.map(s => TOOLS.find(t => t.slug === s)).filter(Boolean) as typeof TOOLS;
  if (related.length === 0) return null;
  return (
    <section className="my-8">
      <h3 className="text-lg font-semibold mb-4">Try next</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {related.map(tool => (
          <Link key={tool.slug} href={`/tools/${tool.slug}`}>
            <Card className="h-full hover-elevate cursor-pointer transition-colors hover:border-primary/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <tool.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{tool.shortDesc}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
