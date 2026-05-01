import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  label?: string;
}

export function GoogleButton({ label = "Continue with Google" }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      asChild
    >
      <a href="/api/auth/google">
        <GoogleIcon className="h-5 w-5 mr-2" />
        {label}
      </a>
    </Button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.227c1.886-1.738 2.986-4.295 2.986-7.351z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.227-2.51c-.895.6-2.04.955-3.391.955-2.605 0-4.81-1.76-5.596-4.123H3.073v2.591A9.997 9.997 0 0 0 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.404 13.9a6.01 6.01 0 0 1 0-3.8V7.51H3.073a9.996 9.996 0 0 0 0 8.982l3.331-2.591z"
      />
      <path
        fill="#EA4335"
        d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.867-2.868C16.96 3.014 14.696 2 12 2 8.105 2 4.74 4.236 3.073 7.51l3.331 2.59C7.19 7.737 9.395 5.977 12 5.977z"
      />
    </svg>
  );
}
