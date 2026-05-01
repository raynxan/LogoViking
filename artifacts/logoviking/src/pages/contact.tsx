import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSubmitContact } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const mut = useSubmitContact();
  const { toast } = useToast();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({ data: { name, email, subject: subject || undefined, message } }, {
      onSuccess: (res) => {
        toast({ title: "Message sent", description: res.message ?? "We'll be in touch soon." });
        setName(""); setEmail(""); setSubject(""); setMessage("");
      }
    });
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-16">
      <Helmet><title>Contact — Logoviking</title><link rel="canonical" href="https://logoviking.com/contact" /></Helmet>
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Get in touch</h1>
        <p className="text-muted-foreground">Questions, feedback, partnerships, or tool requests — we read everything.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card><CardContent className="p-5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary"><Mail className="h-5 w-5" /></div>
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">General</div>
            <div className="text-sm font-medium">hello@logoviking.com</div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Response time</div>
          <div className="text-sm font-medium mt-1">Within 24 hours, weekdays</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Office hours</div>
          <div className="text-sm font-medium mt-1">Mon–Fri, 9am–6pm CET</div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Send us a message</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            </div>
            <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} /></div>
            <div><Label>Message</Label><Textarea rows={6} value={message} onChange={e => setMessage(e.target.value)} required /></div>
            {mut.error && <p className="text-sm text-destructive">Could not send your message. Please try again.</p>}
            <Button type="submit" disabled={mut.isPending} size="lg">
              {mut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
