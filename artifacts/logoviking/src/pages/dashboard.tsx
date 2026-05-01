import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { AccountSecurityCard } from "@/components/auth/AccountSecurityCard";
import {
  useGetUserHistory,
  getGetUserHistoryQueryKey,
  useCreateBillingPortal,
  getGetCurrentUserQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TOOLS } from "@/lib/tools";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: history } = useGetUserHistory({
    query: { queryKey: getGetUserHistoryQueryKey(), enabled: !!user }
  });
  const portalMutation = useCreateBillingPortal();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is active. Enjoy the new perks.",
      });
      queryClient.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [toast, queryClient]);

  if (isLoading) {
    return <div className="container max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Helmet><title>Dashboard — Logoviking</title></Helmet>
        <Card>
          <CardHeader><CardTitle>Sign in to view your dashboard</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Track your tool history, save outputs, and unlock Pro features by signing in.</p>
            <div className="flex gap-2">
              <Button asChild className="flex-1"><Link href="/login">Sign in</Link></Button>
              <Button asChild variant="outline" className="flex-1"><Link href="/signup">Create account</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const featured = TOOLS.slice(0, 6);
  const isPro = user.plan === "pro";
  const canManageBilling = Boolean(user.hasBilling);

  const handleManageBilling = () => {
    portalMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res?.url) {
          window.location.href = res.url;
        } else {
          toast({
            title: "Couldn't open billing portal",
            description: "Try again in a moment.",
            variant: "destructive",
          });
        }
      },
      onError: (err) => {
        const message =
          (err as { message?: string })?.message ?? "Try again in a moment.";
        toast({
          title: "Couldn't open billing portal",
          description: message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Helmet><title>Dashboard — Logoviking</title></Helmet>
      <header className="flex items-start justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={user.name}
            email={user.email}
            avatarUrl={user.avatarUrl}
            className="h-14 w-14 text-base"
            data-testid="avatar-dashboard"
          />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">Here's a quick view of your activity.</p>
          </div>
        </div>
        <Badge
          variant={isPro ? "default" : "secondary"}
          className="uppercase"
          data-testid="badge-plan"
        >
          {user.plan} plan
        </Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Tools used (last 20)" value={String(history?.items.length ?? 0)} />
        <StatCard label="Account email" value={user.email} small />
        <StatCard label="Plan" value={isPro ? "Pro" : "Free"} />
      </div>

      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {isPro ? (
              <>
                You're on the <span className="font-medium text-foreground">Pro plan</span>. Manage payment method, invoices, or cancel anytime.
              </>
            ) : (
              <>
                You're on the <span className="font-medium text-foreground">Free plan</span>. Upgrade to remove ads, unlock priority support, and more.
              </>
            )}
          </div>
          <div className="flex gap-2">
            {isPro ? null : (
              <Button asChild data-testid="button-go-pricing">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            )}
            {canManageBilling && (
              <Button
                variant="outline"
                onClick={handleManageBilling}
                disabled={portalMutation.isPending}
                data-testid="button-manage-billing"
              >
                {portalMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opening…
                  </>
                ) : (
                  "Manage billing"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AccountSecurityCard user={user} />

      <Card className="mb-12">
        <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
        <CardContent>
          {history?.items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr><th className="py-2">Tool</th><th className="py-2">Summary</th><th className="py-2">When</th></tr>
                </thead>
                <tbody>
                  {history.items.map(h => (
                    <tr key={h.id} className="border-b border-border/40">
                      <td className="py-2 font-medium">{h.tool}</td>
                      <td className="py-2 text-muted-foreground">{h.summary}</td>
                      <td className="py-2 text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activity yet. Try a tool to see it here.</p>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Discover more tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featured.map(t => (
          <Link key={t.slug} href={`/tools/${t.slug}`}>
            <Card className="h-full hover-elevate transition-colors hover:border-primary/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary"><t.icon className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.shortDesc}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <Card><CardContent className="p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 font-bold ${small ? "text-base truncate" : "text-3xl"}`}>{value}</div>
    </CardContent></Card>
  );
}
