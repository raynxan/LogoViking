import { LegalLayout } from "./_LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" slug="privacy-policy">
      <p>This Privacy Policy explains how Logoviking ("we", "us", or "our") collects, uses and protects your information when you visit logoviking.com.</p>
      <h2>Information we collect</h2>
      <p>We collect minimal information: your IP address, browser type and pages visited (standard analytics) and, only if you create an account, your name, email and password (hashed). When you use a tool, the inputs you submit are processed for that single request.</p>
      <h2>How image tools work</h2>
      <p>Our image tools (compress, resize, crop, convert, watermark, background remover, smart optimizer) run entirely in your browser. Your image files are never uploaded to our servers.</p>
      <h2>Cookies</h2>
      <p>We use a small number of essential cookies for session management and theme preference. We do not run third-party advertising cookies on our domain.</p>
      <h2>Third-party services</h2>
      <p>We may embed YouTube thumbnail URLs from img.youtube.com when you use the thumbnail downloader. No personal data is shared with YouTube as part of these requests.</p>
      <h2>Data retention</h2>
      <p>Account data is retained as long as your account exists. Tool history is kept for 30 days on the Free plan and indefinitely on Pro. You can request deletion at any time.</p>
      <h2>Your rights</h2>
      <p>You can request access, correction or deletion of your data by contacting <a href="/contact">our support team</a>. Under GDPR you may also lodge a complaint with your local data authority.</p>
      <h2>Children</h2>
      <p>Logoviking is not directed at children under 13.</p>
      <h2>Changes</h2>
      <p>We may update this policy. Material changes will be notified via this page.</p>
    </LegalLayout>
  );
}
