import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChangeOrder, useUpdateChangeOrder } from "@/hooks/useChangeOrders";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Loader2, Send, Ban, Clock, FileText, Calendar,
  CheckCircle2, XCircle, DollarSign, Edit, Download, CheckCheck, ImageIcon, RefreshCw, Copy, Share2,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { parseChangeOrderError } from "@/lib/supabase-errors";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const categoryLabels: Record<string, string> = {
  structural: "שלד ובטון", concrete: "יציקות", electrical: "חשמל",
  plumbing: "אינסטלציה", aluminum: "אלומיניום", kitchen: "מטבח",
  finishing: "גמרים", flooring: "ריצוף", painting: "צביעה",
  insulation: "איטום", hvac: "מיזוג", landscaping: "פיתוח חוץ",
  safety: "בטיחות", other: "אחר",
};

function formatDate(dateStr: string) {
  return format(new Date(dateStr), "d בMMM yyyy, HH:mm", { locale: he });
}

const statusLabels: Record<string, string> = {
  draft: "טיוטה",
  priced: "תומחר",
  sent: "נשלח",
  approved: "חתום",
  rejected: "נדחה",
  canceled: "בוטל",
};

const actionLabels: Record<string, string> = {
  status_change: "שינוי סטטוס",
  change_created: "נוצר",
  change_sent: "נשלח ללקוח",
  reminder_sent: "תזכורת נשלחה",
  change_approved: "חתום",
  change_rejected: "נדחה",
  CLIENT_OPENED_PORTAL: "הלקוח צפה בשינוי",
  client_generated_token: "הלקוח פתח קישור חתימה",
  EXPORT_PDF: "הופק PDF",
};

function translateStatus(status: string): string {
  return statusLabels[status] ?? status;
}

function translateAction(action: string): string {
  return actionLabels[action] ?? action;
}

function SignaturePreview({ signaturePath }: { signaturePath: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage
      .from("signatures")
      .createSignedUrl(signaturePath, 86400)
      .then(({ data }) => {
        if (data?.signedUrl) setUrl(data.signedUrl);
      });
  }, [signaturePath]);

  if (!url) return null;

  return (
    <div className="border-t border-success/20 pt-3">
      <p className="text-xs text-muted-foreground mb-2">חתימה דיגיטלית:</p>
      <div className="rounded-xl bg-white p-3 border border-success/20">
        <img src={url} alt="חתימת הלקוח" className="max-h-24 mx-auto object-contain" />
      </div>
    </div>
  );
}

// Demo data
const demoChangeOrdersMap: Record<string, any> = {
  "demo-co-1": {
    id: "demo-co-1", title: "שינוי שלד קומה ב׳", status: "approved",
    category: "structural", description: "שינוי במבנה השלד בקומה השנייה. כולל: הזזת קיר פנימי, תוספת תמיכה, ויציקת בטון נוספת.",
    price_amount: 45000, include_vat: true, vat_rate: 17, impact_days: 14,
    created_at: "2024-12-15T10:00:00Z", updated_at: "2025-01-10T12:00:00Z",
  },
  "demo-co-2": {
    id: "demo-co-2", title: "שדרוג מטבח אלון", status: "sent",
    category: "kitchen", description: "החלפת ארונות מטבח לאלון מלא, שיש קיסר, כיור כפול נירוסטה וברז מסתובב. כולל פירוק הישן והתקנה מלאה.",
    price_amount: 28000, include_vat: true, vat_rate: 17, impact_days: 7,
    created_at: "2025-01-03T14:30:00Z", updated_at: "2025-01-20T09:00:00Z",
  },
  "demo-co-3": {
    id: "demo-co-3", title: "ריצוף פורצלן סלון", status: "draft",
    category: "flooring", description: "ריצוף פורצלן 60x120 בגוון אפור בהיר. כולל חיפוי קירות חלקי, פנלים וניקיון סופי.",
    price_amount: 9200, include_vat: false, vat_rate: 17, impact_days: 3,
    created_at: "2025-02-01T09:00:00Z", updated_at: "2025-02-01T09:00:00Z",
  },
};

const demoTimeline = [
  { id: "1", action: "נוצר", performed_at: "2024-12-15T10:00:00Z", old_value: null, new_value: { status: "draft" } },
  { id: "2", action: "תומחר", performed_at: "2024-12-20T11:00:00Z", old_value: { status: "draft" }, new_value: { status: "priced" } },
  { id: "3", action: "נשלח", performed_at: "2025-01-05T08:00:00Z", old_value: { status: "priced" }, new_value: { status: "sent" } },
  { id: "4", action: "אושר", performed_at: "2025-01-10T12:00:00Z", old_value: { status: "sent" }, new_value: { status: "approved" } },
];

const isValidUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const ChangeOrderDetail = () => {
  const { projectId, changeId } = useParams<{ projectId: string; changeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDemo = !user;
  const validChangeId = changeId && isValidUuid(changeId) ? changeId : undefined;

  const { data: co, isLoading } = useChangeOrder(isDemo ? "" : (validChangeId ?? ""));
  const updateCO = useUpdateChangeOrder();

  // Determine if user is a client (not the owner)
  const isClient = !!co && co.user_id !== user?.id;

  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderLink, setReminderLink] = useState<string | null>(null);
  const [clientSignLoading, setClientSignLoading] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project_for_co", co?.project_id],
    enabled: !!co?.project_id && !isDemo,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("client_name, client_phone, name").eq("id", co!.project_id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: timeline } = useQuery({
    queryKey: ["audit_log", validChangeId],
    enabled: !!validChangeId && !isDemo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log").select("*")
        .eq("record_id", validChangeId!).eq("table_name", "change_orders")
        .order("performed_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: approval } = useQuery({
    queryKey: ["approval", validChangeId],
    enabled: !!validChangeId && !isDemo && (co?.status === "approved" || co?.status === "rejected"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals").select("*")
        .eq("change_order_id", validChangeId!)
        .order("signed_at", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: attachments } = useQuery({
    queryKey: ["attachments", validChangeId],
    enabled: !!validChangeId && !isDemo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attachments")
        .select("id, file_name, file_url, file_type, context")
        .eq("change_order_id", validChangeId!);
      if (error) throw error;
      if (!data) return [];
      const enriched = await Promise.all(
        data.map(async (att) => {
          const { data: signed } = await supabase.storage
            .from("attachments")
            .createSignedUrl(att.file_url, 86400);
          return { ...att, file_url: signed?.signedUrl ?? att.file_url };
        })
      );
      return enriched;
    },
  });

  const { data: viewedEntries } = useQuery({
    queryKey: ["viewed_co", validChangeId],
    enabled: !!validChangeId && !isDemo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("id")
        .eq("record_id", validChangeId!)
        .eq("action", "CLIENT_OPENED_PORTAL")
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  const isViewed = (viewedEntries ?? []).length > 0;
  const beforePhotos = (attachments ?? []).filter((a) => a.context === "BEFORE" && a.file_type === "image");
  const afterPhotos = (attachments ?? []).filter((a) => a.context === "AFTER" && a.file_type === "image");

  // Send reminder handler
  const handleSendReminder = async () => {
    if (!co) return;
    setReminderLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-portal-token", {
        body: { change_order_id: co.id },
      });
      if (error || data?.error) {
        toast.error(data?.error || "שגיאה בשליחת תזכורת");
        return;
      }
      const token = data?.token;
      if (!token) {
        toast.error("שגיאה ביצירת קישור");
        return;
      }
      const portalUrl = `${window.location.origin}/portal/${token}`;
      setReminderLink(portalUrl);
      // Refresh timeline
      queryClient.invalidateQueries({ queryKey: ["audit_log", validChangeId] });
      toast.success("קישור תזכורת נוצר");
    } catch {
      toast.error("שגיאה בשליחת תזכורת");
    } finally {
      setReminderLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (reminderLink) {
      navigator.clipboard.writeText(reminderLink);
      toast.success("הקישור הועתק");
    }
  };

  const handleWhatsAppReminder = () => {
    if (!reminderLink || !project) return;
    const clientPhone = project.client_phone?.replace(/[^0-9+]/g, "") || "";
    const phone = clientPhone ? `972${clientPhone.replace(/^0/, "")}` : "";
    const clientName = project.client_name || project.name || "";
    const msg = encodeURIComponent(`שלום ${clientName},\nתזכורת: יש שינוי שממתין לאישורך.\nלצפייה ואישור: ${reminderLink}`);
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  };

  // Demo mode
  if (isDemo) {
    const demoCo = demoChangeOrdersMap[changeId ?? ""];
    if (!demoCo) {
      return <div className="p-6 text-center"><p className="text-muted-foreground">שינוי לא נמצא</p></div>;
    }

    const totalPrice = demoCo.include_vat
      ? demoCo.price_amount * (1 + demoCo.vat_rate / 100)
      : demoCo.price_amount;

    return (
      <div dir="rtl" className="px-4 py-6 space-y-5 pb-28">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/projects/${projectId}`)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors" style={{ border: '1px solid var(--border-default)' }}>
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{demoCo.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge variant={demoCo.status} />
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded" style={{ border: '1px solid var(--border-subtle)' }}>{categoryLabels[demoCo.category]}</span>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">מחיר סופי</p>
              <p className="text-2xl font-bold">₪{totalPrice.toLocaleString("he-IL", { maximumFractionDigits: 0 })}</p>
              {demoCo.include_vat && (
                <p className="text-xs text-muted-foreground">כולל מע״מ {demoCo.vat_rate}% · בסיס ₪{demoCo.price_amount.toLocaleString("he-IL")}</p>
              )}
            </div>
               <div className="text-center">
                <p className="text-sm text-muted-foreground">השפעה על לוח זמנים</p>
                <p className="text-lg font-bold text-accent">+{demoCo.impact_days} ימים</p>
              </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">תיאור</p>
            <p className="text-sm whitespace-pre-wrap">{demoCo.description}</p>
          </CardContent>
        </Card>

        {demoCo.status === "approved" && (
          <Card className="border-success/30">
            <CardContent className="p-4 space-y-1">
              <p className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                אושר ע״י דוד כהן
              </p>
              <p className="text-xs text-muted-foreground">10 בינו׳ 2025, 12:00</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> היסטוריה
          </h2>
          <div className="relative pr-4">
            <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-4">
              {demoTimeline.slice(0, demoCo.status === "approved" ? 4 : demoCo.status === "sent" ? 3 : 1).map((entry, idx, arr) => (
                <div key={entry.id} className="relative flex gap-3 items-start">
                  <div className={`relative z-10 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    idx === arr.length - 1 ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                  }`}>
                    {idx === arr.length - 1 && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{entry.action}</span>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.performed_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>נוצר {formatDate(demoCo.created_at)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Real data
  const handleCancel = async () => {
    if (!co) return;
    try {
      await updateCO.mutateAsync({ id: co.id, status: "canceled" });
      toast.success("השינוי בוטל");
    } catch (err: any) { toast.error(parseChangeOrderError(err)); }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!co) {
    return <div className="p-6 text-center"><p className="text-muted-foreground">שינוי לא נמצא</p></div>;
  }

  const isTerminal = ["approved", "rejected", "canceled"].includes(co.status);
  const totalPrice = co.price_amount != null
    ? co.include_vat ? Number(co.price_amount) * (1 + Number(co.vat_rate) / 100) : Number(co.price_amount)
    : null;

  return (
    <div dir="rtl" className="px-4 py-6 space-y-5 pb-28">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors" style={{ border: '1px solid var(--border-default)' }}>
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{co.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {co.status === "approved" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-success/15 text-success border border-success/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                שינוי חתום
              </span>
            ) : (
              <StatusBadge variant={co.status as any} />
            )}
            {isViewed && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' }}>
                <CheckCheck className="h-3 w-3" />
                נצפה
              </span>
            )}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded" style={{ border: '1px solid var(--border-subtle)' }}>{categoryLabels[co.category] ?? co.category}</span>
          </div>
        </div>
      </div>

      {/* Before / After Comparison */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              השוואה ויזואלית
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-center text-muted-foreground">לפני</p>
                {beforePhotos.length > 0 ? beforePhotos.map((p) => (
                  <div key={p.id} className="aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
                    <img src={p.file_url} alt={p.file_name} className="h-full w-full object-cover" />
                  </div>
                )) : (
                  <div className="aspect-[4/3] flex items-center justify-center rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground/50">אין תמונה</p>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-center text-primary">אחרי</p>
                {afterPhotos.length > 0 ? afterPhotos.map((p) => (
                  <div key={p.id} className="aspect-[4/3] overflow-hidden rounded-xl" style={{ border: '2px solid hsl(var(--primary) / 0.4)' }}>
                    <img src={p.file_url} alt={p.file_name} className="h-full w-full object-cover" />
                  </div>
                )) : (
                  <div className="aspect-[4/3] flex items-center justify-center rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground/50">אין תמונה</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPrice != null && totalPrice > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">מחיר סופי</p>
              <p className="text-2xl font-bold">₪{totalPrice.toLocaleString("he-IL", { maximumFractionDigits: 0 })}</p>
              {co.include_vat && (
                <p className="text-xs text-muted-foreground">כולל מע״מ {Number(co.vat_rate)}% · בסיס ₪{Number(co.price_amount).toLocaleString("he-IL")}</p>
              )}
            </div>
            {(co.impact_days ?? 0) !== 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">השפעה על לוח זמנים</p>
                <p className="text-lg font-bold text-accent">{co.impact_days! > 0 ? "+" : ""}{co.impact_days} ימים</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {co.description && (
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground mb-1">תיאור</p><p className="text-sm whitespace-pre-wrap">{co.description}</p></CardContent></Card>
      )}

      {approval && co.status === "approved" && (
        <Card className="border-success/40 bg-success/5">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-success">שינוי חתום ✔</p>
                <p className="text-xs text-muted-foreground">אושר וחתום דיגיטלית</p>
              </div>
            </div>
            <div className="border-t border-success/20 pt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">חתם:</span>
                <span className="font-semibold">{approval.client_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">תאריך חתימה:</span>
                <span className="font-medium">{formatDate(approval.signed_at)}</span>
              </div>
            </div>
            {approval.signature_url && (
              <SignaturePreview signaturePath={approval.signature_url} />
            )}
          </CardContent>
        </Card>
      )}

      {approval && co.status === "rejected" && (
        <Card className="border-destructive/30">
          <CardContent className="p-4 space-y-1">
            <p className="text-sm font-semibold flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              נדחה ע״י {approval.client_name}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(approval.signed_at)}</p>
            {approval.rejection_reason && <p className="text-sm mt-2 text-destructive bg-destructive/10 rounded p-2">סיבת דחייה: {approval.rejection_reason}</p>}
          </CardContent>
        </Card>
      )}

      {/* Reminder link actions */}
      {reminderLink && co.status === "sent" && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              קישור תזכורת נוצר
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" /> העתק קישור
              </Button>
              <Button size="sm" className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white" onClick={handleWhatsAppReminder}>
                <WhatsAppIcon className="h-4 w-4" /> שלח בוואטסאפ
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <h2 className="text-base font-bold flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> היסטוריה</h2>
        {timeline && timeline.length > 0 ? (
          <div className="relative pr-4">
            <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-4">
              {timeline.map((entry, idx) => {
                const newStatus = (entry.new_value as any)?.status;
                const oldStatus = (entry.old_value as any)?.status;
                return (
                  <div key={entry.id} className="relative flex gap-3 items-start">
                    <div className={`relative z-10 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${idx === timeline.length - 1 ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"}`}>
                      {idx === timeline.length - 1 && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{oldStatus && newStatus ? `${translateStatus(oldStatus)} → ${translateStatus(newStatus)}` : translateAction(entry.action)}</span>
                      <p className="text-xs text-muted-foreground">{formatDate(entry.performed_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">אין היסטוריה עדיין</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3.5 w-3.5" /><span>נוצר {formatDate(co.created_at)}</span>
        </div>
      </div>

      {/* PDF Download for terminal states */}
      {(co.status === "approved" || co.status === "rejected") && (
        <PdfDownloadButton changeOrderId={co.id} />
      )}

      {/* Client pending signature banner */}
      {isClient && co.status === "sent" && (
        <div className="space-y-3">
          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/15">
                  <Send className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-warning">ממתין לחתימתך</p>
                  <p className="text-xs text-muted-foreground">שינוי זה נשלח לאישורך. לחץ למטה כדי לחתום ולאשר.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2 bg-gradient-to-t from-background via-background to-transparent pt-6">
            <Button
              size="lg"
              className="w-full text-base font-extrabold h-[56px] bg-success text-success-foreground hover:bg-success/90"
              onClick={async () => {
                setClientSignLoading(true);
                try {
                  const { data: resp, error: fnErr } = await supabase.functions.invoke("generate-client-token", {
                    body: { change_order_id: co.id },
                  });
                  if (fnErr || resp?.error) {
                    toast.error(resp?.error || "שגיאה ביצירת קישור חתימה");
                    return;
                  }
                  const portalUrl = `/portal/${resp.token}`;
                  navigate(portalUrl);
                } catch {
                  toast.error("שגיאה ביצירת קישור חתימה");
                } finally {
                  setClientSignLoading(false);
                }
              }}
              disabled={clientSignLoading}
            >
              {clientSignLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              חתום ואשר שינוי
            </Button>
          </div>
        </div>
      )}

      {!isTerminal && !isClient && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2 bg-gradient-to-t from-background via-background to-transparent pt-6">
          <div className="flex gap-2">
            {co.status === "draft" && (
              <>
                <Button className="flex-1" onClick={() => navigate(`/projects/${projectId}/changes/new`, { state: { editId: co.id } })}><Edit className="h-4 w-4" />עריכה ותמחור</Button>
                <Button variant="outline" size="icon" onClick={handleCancel}><Ban className="h-4 w-4" /></Button>
              </>
            )}
            {co.status === "priced" && (
              <>
                <Button className="flex-1" onClick={() => navigate(`/projects/${projectId}/changes/${co.id}/send`)}><Send className="h-4 w-4" />שלח ללקוח</Button>
                <Button variant="outline" size="icon" onClick={handleCancel}><Ban className="h-4 w-4" /></Button>
              </>
            )}
            {co.status === "sent" && (
              <>
                <Button className="flex-1" onClick={handleSendReminder} disabled={reminderLoading}>
                  {reminderLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  שלח תזכורת
                </Button>
                <Button variant="outline" size="icon" onClick={handleCancel}><Ban className="h-4 w-4" /></Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function PdfDownloadButton({ changeOrderId }: { changeOrderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-pdf", {
        body: { change_order_id: changeOrderId },
      });
      if (error || data?.error) {
        toast.error(data?.error || "שגיאה בהפקת PDF");
        return;
      }
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("שגיאה בהפקת PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      הורד PDF
    </Button>
  );
}

export default ChangeOrderDetail;
