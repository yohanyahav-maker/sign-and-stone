import { Mail, Instagram } from "lucide-react";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.3z" />
    </svg>
  );
}

export function SocialFooter() {
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <a
        href="mailto:info@shinuy-hatum.co.il"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="אימייל"
      >
        <Mail className="h-5 w-5" />
      </a>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="אינסטגרם"
      >
        <Instagram className="h-5 w-5" />
      </a>
      <a
        href="https://tiktok.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
        aria-label="טיקטוק"
      >
        <TikTokIcon className="h-5 w-5" />
      </a>
    </div>
  );
}
