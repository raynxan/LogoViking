import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/components/auth/AuthContext";
import { useGetUserHistory, getGetUserHistoryQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOOLS } from "@/lib/tools";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { data: history } = useGetUserHistory({
    query: { queryKey: getGetUserHistoryQueryKey(), enabled: !!user }
  });

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

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <Helmet><title>Dashboard — Logoviking</title></Helmet>
      <header className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Here's a quick view of your activity.</p>
        </div>
        <Badge variant="secondary" className="uppercase">{user.plan} plan</Badge>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="Tools used (last 20)" value={String(history?.items.length ?? 0)} />
        <StatCard label="Account email" value={user.email} small />
        <StatCard label="Plan" value={user.plan === "pro" ? "Pro" : "Free"} />
      </div>

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
