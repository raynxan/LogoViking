import { Helmet } from "react-helmet-async";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const FREE_FEATURES = [
  "All 26 tools, no exceptions",
  "No signup required to use",
  "No watermarks on outputs",
  "Private, browser-side image processing",
  "Standard rate limits",
  "Community support",
];
const PRO_FEATURES = [
  "Everything in Free",
  "Higher generation rate limits",
  "No advertisements",
  "Priority support (24h response)",
  "Permanent history (vs 30 days)",
  "Early access to new tools",
];

export default function Pricing() {
  const { toast } = useToast();
  return (
    <div className="container max-w-5xl mx-auto px-4 py-16">
      <Helmet><title>Pricing — Logoviking</title><link rel="canonical" href="https://logoviking.com/pricing" /></Helmet>
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Simple, honest pricing</h1>
        <p className="text-lg text-muted-foreground">Start free. Upgrade when you outgrow it.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <Badge variant="secondary" className="self-start mb-2">Free</Badge>
            <CardTitle className="text-3xl">$0<span className="text-base font-normal text-muted-foreground"> / forever</span></CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Everything you need to ship faster.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{f}</span></li>
              ))}
            </ul>
            <Button className="w-full mt-4" variant="outline" disabled>Current plan</Button>
          </CardContent>
        </Card>

        <Card className="border-primary/40 shadow-xl shadow-primary/10 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider">Coming soon</div>
          <CardHeader>
            <Badge className="self-start mb-2">Pro</Badge>
            <CardTitle className="text-3xl">$9<span className="text-base font-normal text-muted-foreground"> / month</span></CardTitle>
            <p className="text-sm text-muted-foreground mt-2">For creators who need more headroom.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{f}</span></li>
              ))}
            </ul>
            <Button className="w-full mt-4" onClick={() => toast({ title: "Pro is coming soon", description: "We'll let you know the moment it's live." })}>Notify me when ready</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
