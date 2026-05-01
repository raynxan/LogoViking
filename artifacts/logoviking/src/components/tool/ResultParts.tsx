import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ResultCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Card className="border-primary/30">
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>{children}</CardContent>
    </Card>
  );
}

export function CopyButton({ value, label = "Copy", size = "sm" }: { value: string; label?: string; size?: "sm" | "default" }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };
  return (
    <Button type="button" variant="outline" size={size} onClick={onCopy}>
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function CodeBlock({ value, lang = "" }: { value: string; lang?: string }) {
  return (
    <div className="relative group">
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs leading-relaxed border border-border whitespace-pre-wrap break-words font-mono">
        <code className={`language-${lang}`}>{value}</code>
      </pre>
      <div className="absolute top-2 right-2">
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export function ListResult({ items }: { items: string[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border bg-muted/30">
          <span className="text-sm break-all">{item}</span>
          <CopyButton value={item} label="" />
        </li>
      ))}
    </ul>
  );
}
