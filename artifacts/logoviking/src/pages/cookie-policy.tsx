import { LegalLayout } from "./_LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" slug="cookie-policy">
      <p>This page explains the cookies and similar technologies used on logoviking.com.</p>
      <h2>What are cookies?</h2>
      <p>Cookies are small text files stored on your device by your browser when you visit a website. They allow sites to remember your preferences and keep you signed in.</p>
      <h2>Cookies we use</h2>
      <ul>
        <li><strong>Essential</strong> — session cookie (<code>lv_session</code>) to keep you signed in, and theme cookie to remember light/dark mode.</li>
        <li><strong>Analytics</strong> — anonymous, aggregated traffic statistics. No personal identification.</li>
      </ul>
      <h2>Advertising</h2>
      <p>If we display advertisements in the future, we will partner with reputable networks that respect your privacy preferences. You can manage ad preferences via your browser or relevant industry opt-outs.</p>
      <h2>Managing cookies</h2>
      <p>You can clear or block cookies via your browser settings. Note that disabling essential cookies may break sign-in.</p>
      <h2>Updates</h2>
      <p>We may update this policy. The "last updated" date at the top reflects the latest version.</p>
    </LegalLayout>
  );
}
