import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthContext";
import {
  useListBillingPlans,
  useCreateBillingCheckout,
  getListBillingPlansQueryKey,
} from "@workspace/api-client-react";

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

function formatPrice(unitAmount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: unitAmount % 100 === 0 ? 0 : 2,
    }).format(unitAmount / 100);
  } catch {
    return `$${(unitAmount / 100).toFixed(2)}`;
  }
}

export default function Pricing() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: plansData, isLoading: plansLoading } = useListBillingPlans({
    query: { queryKey: getListBillingPlansQueryKey() },
  });

  const checkoutMutation = useCreateBillingCheckout();

  useEffect(() => {
    const search = window.location.search;
    if (search.includes("checkout=cancelled")) {
      toast({
        title: "Checkout cancelled",
        description: "You can complete the upgrade any time.",
      });
    }
  }, [toast]);

  const proPlan = plansData?.plans.find((p) =>
    p.name?.toLowerCase().includes("pro"),
  );
  const monthlyPrice =
    proPlan?.prices.find((pr) => pr.interval === "month") ??
    proPlan?.prices[0];

  const isPro = user?.plan === "pro";
  const billingConfigured = plansData?.configured ?? false;

  const handleUpgrade = () => {
    if (!user) {
      setLocation("/login?next=/pricing");
      return;
    }
    if (isPro) return;
    checkoutMutation.mutate(
      { data: monthlyPrice ? { priceId: monthlyPrice.id } : {} },
      {
        onSuccess: (res) => {
          if (res?.url) {
            window.location.href = res.url;
          } else {
            toast({
              title: "Checkout failed",
              description: "We couldn't start checkout. Try again.",
              variant: "destructive",
            });
          }
        },
        onError: (err) => {
          const message =
            (err as { message?: string })?.message ?? "Try again in a moment.";
          toast({
            title: "Checkout failed",
            description: message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const proPriceLabel = monthlyPrice
    ? formatPrice(monthlyPrice.unitAmount, monthlyPrice.currency)
    : "$9";
  const proIntervalLabel = monthlyPrice?.interval
    ? ` / ${monthlyPrice.interval}`
    : " / month";

  return (
    <div className="container max-w-5xl mx-auto px-4 py-16">
      <Helmet>
        <title>Pricing — Logoviking</title>
        <link rel="canonical" href="https://logoviking.com/pricing" />
      </Helmet>
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">
          Simple, honest pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Start free. Upgrade when you outgrow it.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <Badge variant="secondary" className="self-start mb-2">
              Free
            </Badge>
            <CardTitle className="text-3xl">
              $0
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / forever
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Everything you need to ship faster.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full mt-4"
              variant="outline"
              disabled
              data-testid="button-current-free"
            >
              {isPro ? "Free plan" : "Current plan"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/40 shadow-xl shadow-primary/10 relative">
          {isPro && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium uppercase tracking-wider">
              Your plan
            </div>
          )}
          <CardHeader>
            <Badge className="self-start mb-2">Pro</Badge>
            <CardTitle className="text-3xl">
              {proPriceLabel}
              <span className="text-base font-normal text-muted-foreground">
                {proIntervalLabel}
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              For creators who need more headroom.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-2 text-sm">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/dashboard" data-testid="link-dashboard">
                  Manage in dashboard
                </Link>
              </Button>
            ) : !billingConfigured && !plansLoading ? (
              <Button
                className="w-full mt-4"
                onClick={() =>
                  toast({
                    title: "Pro is coming soon",
                    description: "Billing is not connected yet.",
                  })
                }
                data-testid="button-notify"
              >
                Notify me when ready
              </Button>
            ) : (
              <Button
                className="w-full mt-4"
                onClick={handleUpgrade}
                disabled={checkoutMutation.isPending || plansLoading}
                data-testid="button-upgrade-pro"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Redirecting…
                  </>
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            )}
            {!user && billingConfigured && (
              <p className="text-xs text-muted-foreground text-center">
                You'll be asked to sign in first.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
