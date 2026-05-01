import { useRoute } from "wouter";
import { TOOLS } from "@/lib/tools";
import NotFound from "./not-found";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { getToolComponent } from "@/components/tools";

export default function ToolPage() {
  const [, params] = useRoute("/tools/:slug");
  const slug = params?.slug;
  const tool = TOOLS.find(t => t.slug === slug);
  if (!tool) return <NotFound />;
  const Component = getToolComponent(tool.slug);
  return (
    <ToolPageLayout tool={tool}>
      {Component ? <Component /> : <p className="text-sm text-muted-foreground">Tool coming soon.</p>}
    </ToolPageLayout>
  );
}
