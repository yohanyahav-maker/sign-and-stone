import { useSubscription } from "@/hooks/useSubscription";

export function SubscriptionBanner() {
  const { data: sub } = useSubscription();

  if (!sub) return null;

  if (sub.status === "trial") {
    const daysLeft = sub.trial_ends_at
      ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
      : 0;

    return (
      <div className="rounded-2xl p-4 flex items-center justify-between"
           style={{ background: 'rgba(212,168,67,0.10)', borderBottom: '1px solid rgba(212,168,67,0.20)' }}>
        <span className="text-sm font-semibold" style={{ color: 'hsl(var(--gold-300))' }}>
          נותרו <span className="font-extrabold text-foreground">{daysLeft}</span> ימי ניסיון
        </span>
      </div>
    );
  }

  if (sub.status === "past_due") {
    return (
      <div className="rounded-2xl p-4"
           style={{ background: 'var(--danger-bg)', borderBottom: '1px solid var(--danger-border)' }}>
        <span className="text-sm text-destructive font-bold">יש בעיה בתשלום</span>
      </div>
    );
  }

  if (sub.status === "canceled" || sub.status === "expired") {
    return (
      <div className="rounded-2xl bg-card p-4" style={{ border: '1px solid var(--border-default)' }}>
        <span className="text-sm text-muted-foreground">המנוי הסתיים — שדרג כדי להמשיך</span>
      </div>
    );
  }

  return null;
}
