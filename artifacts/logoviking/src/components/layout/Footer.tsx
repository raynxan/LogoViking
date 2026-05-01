import { Link } from "wouter";
import { TOOLS } from "@/lib/tools";

export function Footer() {
  const categories = Array.from(new Set(TOOLS.map((t) => t.category)));

  return (
    <footer className="border-t bg-muted/40 py-12 md:py-16 mt-auto">
      <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div className="space-y-4">
          <div className="font-bold text-lg text-primary flex items-center space-x-2">
            <img src="/images/logoviking-header.png" alt="LogoViking" className="h-16 w-auto" />
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Viking-grade tools for modern creators. Free, fast, and secure. No signup required.
          </p>
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Logoviking. All rights reserved.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-foreground">Top Tools</h3>
          <ul className="space-y-3">
            {TOOLS.slice(0, 6).map((tool) => (
              <li key={tool.slug}>
                <Link href={`/tools/${tool.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {tool.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/tools" className="text-primary hover:underline transition-colors font-medium">
                View all 26 tools &rarr;
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-foreground">Company</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </li>
            <li>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </li>
            <li>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </li>
            <li>
              <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link>
            </li>
            <li>
              <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">Disclaimer</Link>
            </li>
            <li>
              <Link href="/dmca" className="text-muted-foreground hover:text-foreground transition-colors">DMCA</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
