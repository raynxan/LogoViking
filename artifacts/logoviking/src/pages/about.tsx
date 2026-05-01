import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-16">
      <Helmet><title>About — Logoviking</title><link rel="canonical" href="https://logoviking.com/about" /></Helmet>
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1>About Logoviking</h1>
        <p className="lead">Logoviking is a focused toolkit for modern creators. We build fast, free, browser-first tools so you can ship content without juggling ten subscriptions.</p>
        <h2>Why we built this</h2>
        <p>Most creator tools online are bloated with sign-up walls, watermarks, and pricing pages disguised as features. We wanted the opposite: a single home for the 26 micro-tools we reach for every week — calculators, generators, image editors, and SEO helpers — all free and all instant.</p>
        <h2>What we believe</h2>
        <ul>
          <li><strong>Speed beats features.</strong> Every tool should respond in under a second.</li>
          <li><strong>Privacy by default.</strong> Image processing happens on your device whenever possible.</li>
          <li><strong>No dark patterns.</strong> No upsell modals, no hidden quotas, no email harvesting.</li>
          <li><strong>One bookmark, 26 tools.</strong> Stop tab-hopping between 10 different sites.</li>
        </ul>
        <h2>Who it's for</h2>
        <p>YouTubers, TikTok creators, indie marketers, side-project builders, and anyone who occasionally needs to compress an image, generate a hashtag set, or scaffold a meta tag. If that's you, welcome.</p>
        <h2>Contact</h2>
        <p>Got an idea or a tool we should add? <a href="/contact">Drop us a note</a>.</p>
      </article>
    </div>
  );
}
