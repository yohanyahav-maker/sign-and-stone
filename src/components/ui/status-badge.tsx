import { cn } from "@/lib/utils";

type StatusVariant = "draft" | "priced" | "sent" | "approved" | "rejected" | "canceled" | "trial" | "active" | "past_due";

const variantStyles: Record<StatusVariant, { bg: string; text: string; border: string }> = {
  draft:    { bg: "rgba(168,164,156,0.12)", text: "hsl(var(--muted-foreground))", border: "rgba(168,164,156,0.20)" },
  priced:   { bg: "rgba(59,130,246,0.12)",  text: "#60A5FA",                     border: "rgba(59,130,246,0.25)" },
  sent:     { bg: "rgba(212,168,67,0.12)",   text: "hsl(var(--gold-300))",        border: "rgba(212,168,67,0.25)" },
  approved: { bg: "rgba(34,197,94,0.12)",    text: "hsl(var(--success))",         border: "rgba(34,197,94,0.25)" },
  rejected: { bg: "rgba(239,68,68,0.12)",    text: "hsl(var(--destructive))",     border: "rgba(239,68,68,0.25)" },
  canceled: { bg: "hsl(var(--muted))",       text: "hsl(var(--muted-foreground))", border: "hsl(var(--border))" },
  trial:    { bg: "rgba(59,130,246,0.12)",   text: "#60A5FA",                     border: "rgba(59,130,246,0.25)" },
  active:   { bg: "rgba(34,197,94,0.12)",    text: "hsl(var(--success))",         border: "rgba(34,197,94,0.25)" },
  past_due: { bg: "rgba(239,68,68,0.12)",    text: "hsl(var(--destructive))",     border: "rgba(239,68,68,0.25)" },
};

const variantLabels: Record<StatusVariant, string> = {
  draft: "טיוטה",
  priced: "תומחר",
  sent: "נשלח",
  approved: "אושר",
  rejected: "נדחה",
  canceled: "בוטל",
  trial: "ניסיון",
  active: "פעיל",
  past_due: "חוב",
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const style = variantStyles[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide",
        className
      )}
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
}
