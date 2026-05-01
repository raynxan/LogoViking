import { useEffect, useState } from "react";

const MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't fully set up yet. Please use email and password for now.",
  google_failed: "We couldn't complete Google sign-in. Please try again.",
  invalid_state: "Your sign-in session expired. Please try again.",
  access_denied: "Google sign-in was cancelled.",
  email_not_verified:
    "Your Google account email hasn't been verified by Google. Please verify it with Google first, or sign in with email and password.",
};

export function OAuthErrorBanner() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) {
      setError(MESSAGES[err] ?? "Sign-in failed. Please try again.");
      params.delete("error");
      const next = params.toString();
      const url = window.location.pathname + (next ? `?${next}` : "");
      window.history.replaceState({}, "", url);
    }
  }, []);

  if (!error) return null;

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {error}
    </div>
  );
}
