import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChangeOrder, useUpdateChangeOrder } from "@/hooks/useChangeOrders";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Loader2,
  Send,
  Ban,
  Clock,
  FileText,
  Tag,
  Calendar,
  CheckCircle2,
  XCircle,
  CircleDot,
  DollarSign,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";

const categoryLabels: Record<string, string> = {
  structural: "מבנה",
  electrical: "חשמל",
  plumbing: "אינסטלציה",
  finishing: "גמרים",
  hvac: "מיזוג",
  flooring: "ריצוף",
  painting: "צביעה",
  landscaping: "גינון",
  safety: "בטיחות",
  other: "אחר",
};

const statusActionMap: Record<string, string> = {
  draft: "תומחר",
  priced: "נשלח ללקוח",
  sent: "אושר / נדחה",
  approved: "אושר",
  rejected: "נדחה",
  canceled: "בוטל",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  priced: <DollarSign className="h-4 w-4" />,
  sent: <Send className="h-4 w-4" />,
  approved: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  canceled: <Ban className="h-4 w-4" />,
};

function formatDate(dateStr: string) {
  return format(new Date(dateStr), "d בMMM yyyy, HH:mm", { locale: he });
}

const ChangeOrderDetail = () => {
  const { projectId, changeId } = useParams<{ projectId: string; changeId: string }>();
  const navigate = useNavigate();
  const { data: co, isLoading } = useChangeOrder(changeId!);
  const updateCO = useUpdateChangeOrder();

  // Fetch audit log timeline
  const { data: timeline } = useQuery({
    queryKey: ["audit_log", changeId],
    enabled: !!changeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("record_id", changeId!)
        .eq("table_name", "change_orders")
        .order("performed_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch approval info if exists
  const { data: approval } = useQuery({
    queryKey: ["approval", changeId],
    enabled: !!changeId && (co?.status === "approved" || co?.status === "rejected"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select("*")
        .eq("change_order_id", changeId!)
        .order("signed_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleCancel = async () => {
    if (!co) return;
    try {
      await updateCO.mutateAsync({ id: co.id, status: "canceled" });
      toast.success("השינוי בוטל");
    } catch {
      toast.error("שגיאה בביטול");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!co) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">שינוי לא נמצא</p>
      </div>
    );
  }

  const isTerminal = ["approved", "rejected", "canceled"].includes(co.status);
  const totalPrice =
    co.price_amount != null
      ? co.include_vat
        ? Number(co.price_amount) * (1 + Number(co.vat_rate) / 100)
        : Number(co.price_amount)
      : null;

  return (
    <div className="px-4 py-6 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{co.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge variant={co.status as any} />
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {categoryLabels[co.category] ?? co.category}
            </span>
          </div>
        </div>
      </div>

      {/* Price Card */}
      {totalPrice != null && totalPrice > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">מחיר סופי</p>
              <p className="text-2xl font-bold">
                ₪{totalPrice.toLocaleString("he-IL", { maximumFractionDigits: 0 })}
              </p>
              {co.include_vat && (
                <p className="text-xs text-muted-foreground">
                  כולל מע״מ {Number(co.vat_rate)}% · בסיס ₪{Number(co.price_amount).toLocaleString("he-IL")}
                </p>
              )}
            </div>
            {(co.impact_days ?? 0) !== 0 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">השפעה</p>
                <p className="text-lg font-bold text-primary">
                  {co.impact_days! > 0 ? "+" : ""}{co.impact_days} ימים
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {co.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-1">תיאור</p>
            <p className="text-sm whitespace-pre-wrap">{co.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Info */}
      {approval && (
        <Card className={co.status === "approved" ? "border-success/30" : "border-destructive/30"}>
          <CardContent className="p-4 space-y-1">
            <p className="text-sm font-semibold flex items-center gap-2">
              {co.status === "approved" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              {co.status === "approved" ? "אושר ע״י" : "נדחה ע״י"} {approval.client_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(approval.signed_at)}
            </p>
            {approval.rejection_reason && (
              <p className="text-sm mt-2 text-destructive bg-destructive/10 rounded p-2">
                סיבת דחייה: {approval.rejection_reason}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" /> היסטוריה
        </h2>

        {timeline && timeline.length > 0 ? (
          <div className="relative pr-4">
            {/* Vertical line */}
            <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-border" />

            <div className="space-y-4">
              {timeline.map((entry, idx) => {
                const newStatus = (entry.new_value as any)?.status;
                const oldStatus = (entry.old_value as any)?.status;
                return (
                  <div key={entry.id} className="relative flex gap-3 items-start">
                    {/* Dot */}
                    <div
                      className={`relative z-10 mt-1 flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                        idx === timeline.length - 1
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 bg-background"
                      }`}
                    >
                      {idx === timeline.length - 1 && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {newStatus && statusIcons[newStatus]}
                        <span className="text-sm font-medium">
                          {oldStatus && newStatus
                            ? `${statusActionMap[oldStatus] ?? oldStatus} → ${statusActionMap[newStatus] ?? newStatus}`
                            : entry.action}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.performed_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">אין היסטוריה עדיין</p>
        )}

        {/* Created at - always show */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Calendar className="h-3.5 w-3.5" />
          <span>נוצר {formatDate(co.created_at)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {!isTerminal && (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pb-2 bg-gradient-to-t from-background via-background to-transparent pt-6">
          <div className="flex gap-2">
            {co.status === "draft" && (
              <>
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/projects/${projectId}/changes/${co.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                  עריכה ותמחור
                </Button>
                <Button variant="outline" size="icon" onClick={handleCancel}>
                  <Ban className="h-4 w-4" />
                </Button>
              </>
            )}

            {co.status === "priced" && (
              <>
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/projects/${projectId}/changes/${co.id}/send`)}
                >
                  <Send className="h-4 w-4" />
                  שלח ללקוח
                </Button>
                <Button variant="outline" size="icon" onClick={handleCancel}>
                  <Ban className="h-4 w-4" />
                </Button>
              </>
            )}

            {co.status === "sent" && (
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                <Ban className="h-4 w-4" />
                ביטול
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeOrderDetail;
