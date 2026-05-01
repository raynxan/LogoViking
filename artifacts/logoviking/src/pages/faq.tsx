import { Helmet } from "react-helmet-async";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Is Logoviking really free?", a: "Yes. Every one of our 26 tools is completely free to use, with no signup required. We may launch a Pro tier in the future for higher rate limits, but the free experience will always include every tool." },
  { q: "Do I need to create an account?", a: "No. You can use any tool instantly. An account simply lets you save your tool history and unlocks future Pro features." },
  { q: "Where is my image processing done?", a: "All image tools (compress, resize, crop, convert, watermark, background remover, smart optimizer) run entirely in your browser. Your files never leave your device." },
  { q: "How accurate are the earnings calculators?", a: "Our YouTube, TikTok and Instagram calculators provide industry-standard estimates based on average CPM, RPM and engagement multipliers. Real earnings vary by niche, audience demographics, advertiser demand and seasonality." },
  { q: "Will Logoviking add my favorite tool?", a: "Probably! We add new tools every month based on user requests. Send us a note via the contact page." },
  { q: "Are my generated outputs really watermark-free?", a: "Yes. We do not stamp anything onto your images, captions, hashtags or any other generated output." },
  { q: "Do you sell my data?", a: "No. We do not sell, rent or share your personal data with anyone. See our privacy policy for the full breakdown." },
  { q: "Can I use Logoviking outputs commercially?", a: "Yes, anything you generate using our tools is yours to use for personal or commercial projects." },
  { q: "What's the difference between Free and Pro?", a: "Free includes every tool, no watermarks, and no signup. Pro (coming soon) adds higher rate limits, no advertisements, priority support, permanent history and early access to new tools for $9/month." },
];

export default function FAQ() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-16">
      <Helmet>
        <title>FAQ — Logoviking</title>
        <link rel="canonical" href="https://logoviking.com/faq" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Frequently asked questions</h1>
        <p className="text-muted-foreground">Quick answers to the things people ask us most.</p>
      </header>
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={`q-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
