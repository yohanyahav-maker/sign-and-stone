import { cn } from "@/lib/utils";

type StatusVariant = "draft" | "priced" | "sent" | "approved" | "rejected" | "canceled" | "trial" | "active" | "past_due";

const variantStyles: Record<StatusVariant, string> = {
  draft: "bg-muted text-muted-foreground",
  priced: "bg-info/15 text-info",
  sent: "bg-amber-50 text-amber-800",
  approved: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
  canceled: "bg-muted text-muted-foreground line-through",
  trial: "bg-info/15 text-info",
  active: "bg-success/15 text-success",
  past_due: "bg-destructive/15 text-destructive",
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
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {label ?? variantLabels[variant]}
    </span>
  );
}
