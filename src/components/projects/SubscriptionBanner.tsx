import { useSubscription } from "@/hooks/useSubscription";

export function SubscriptionBanner() {
  const { data: sub } = useSubscription();

  if (!sub) return null;

  if (sub.status === "trial") {
    const daysLeft = sub.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
      : 0;

    return (
      <div className="rounded-[14px] bg-card border border-border p-4">
        <span className="text-sm text-muted-foreground">
          נותרו <span className="font-semibold text-foreground">{daysLeft}</span> ימי ניסיון
        </span>
      </div>
    );
  }

  if (sub.status === "past_due") {
    return (
      <div className="rounded-[14px] bg-card border border-destructive/20 p-4">
        <span className="text-sm text-destructive font-medium">יש בעיה בתשלום</span>
      </div>
    );
  }

  if (sub.status === "canceled" || sub.status === "expired") {
    return (
      <div className="rounded-[14px] bg-card border border-border p-4">
        <span className="text-sm text-muted-foreground">המנוי הסתיים — שדרג כדי להמשיך</span>
      </div>
    );
  }

  return null;
}
