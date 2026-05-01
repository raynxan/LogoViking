import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useRegister, getGetCurrentUserQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const mut = useRegister();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { name, email, password } }, {
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: getGetCurrentUserQueryKey() });
        navigate("/dashboard");
      }
    });
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <Helmet><title>Create account — Logoviking</title></Helmet>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">Free forever. Save your history and access pro features later.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
            <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div><Label>Password (min 6 chars)</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required autoComplete="new-password" /></div>
            {mut.error && <p className="text-sm text-destructive">{(mut.error as any)?.message || "Could not create account."}</p>}
            <Button type="submit" disabled={mut.isPending} size="lg" className="w-full">
              {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create account
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
