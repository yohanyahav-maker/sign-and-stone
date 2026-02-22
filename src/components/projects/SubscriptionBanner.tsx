import { useSubscription } from "@/hooks/useSubscription";
import { StatusBadge } from "@/components/ui/status-badge";

export function SubscriptionBanner() {
  const { data: sub } = useSubscription();

  if (!sub) return null;

  if (sub.status === "trial") {
    const daysLeft = sub.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
      : 0;

    return (
      <div className="rounded-lg bg-info/10 border border-info/20 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge variant="trial" />
          <span className="text-sm font-medium">
            נותרו {daysLeft} ימי ניסיון
          </span>
        </div>
      </div>
    );
  }

  if (sub.status === "past_due") {
    return (
      <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge variant="past_due" />
          <span className="text-sm font-medium">יש בעיה בתשלום</span>
        </div>
      </div>
    );
  }

  if (sub.status === "canceled" || sub.status === "expired") {
    return (
      <div className="rounded-lg bg-muted border border-border p-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          המנוי הסתיים — שדרג כדי להמשיך
        </span>
      </div>
    );
  }

  return null;
}
