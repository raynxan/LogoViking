import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useLogin, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { OAuthErrorBanner } from "@/components/auth/OAuthErrorBanner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const mut = useLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { email, password } }, {
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        navigate("/dashboard");
      }
    });
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <Helmet><title>Sign in — Logoviking</title></Helmet>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in to access your dashboard and history.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <OAuthErrorBanner />
          <GoogleButton label="Continue with Google" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or sign in with email</span>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></div>
            {mut.error && <p className="text-sm text-destructive">Invalid email or password.</p>}
            <Button type="submit" disabled={mut.isPending} size="lg" className="w-full">
              {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sign in
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              No account? <Link href="/signup" className="text-primary hover:underline">Create one</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
