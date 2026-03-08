import { cn } from "@/lib/utils";

type StatusVariant = "draft" | "priced" | "sent" | "approved" | "rejected" | "canceled" | "trial" | "active" | "past_due";

const variantStyles: Record<StatusVariant, string> = {
  draft:    "bg-muted text-muted-foreground border-border",
  priced:   "bg-info/10 text-info border-info/25",
  sent:     "bg-warning/10 text-warning border-warning/25",
  approved: "bg-success/10 text-success border-success/25",
  rejected: "bg-destructive/10 text-destructive border-destructive/25",
  canceled: "bg-muted text-muted-foreground border-border",
  trial:    "bg-primary/10 text-primary border-primary/25",
  active:   "bg-success/10 text-success border-success/25",
  past_due: "bg-destructive/10 text-destructive border-destructive/25",
};

const variantLabels: Record<StatusVariant, string> = {
  draft: "טיוטה",
  priced: "תומחר",
  sent: "ממתין לחתימה",
  approved: "חתום ✔",
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
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide border",
        variantStyles[variant],
        className
      )}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
}
