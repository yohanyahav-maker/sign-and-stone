import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Send, Copy, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useChangeOrder } from "@/hooks/useChangeOrders";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const categoryLabels: Record<string, string> = {
  structural: "מבנה", electrical: "חשמל", plumbing: "אינסטלציה",
  finishing: "גמרים", hvac: "מיזוג", flooring: "ריצוף",
  painting: "צביעה", landscaping: "גינון", safety: "בטיחות", other: "אחר",
};

const SendChange = () => {
  const { projectId, changeId } = useParams<{ projectId: string; changeId: string }>();
  const navigate = useNavigate();
  const { data: co, isLoading } = useChangeOrder(changeId!);
  const [sending, setSending] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Fetch project for client info
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const portalUrl = portalToken
    ? `${window.location.origin}/portal/${portalToken}`
    : null;

  const handleSend = async () => {
    if (!co) return;
    setSending(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "generate-portal-token",
        { body: { change_order_id: co.id } }
      );

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setPortalToken(data.token);
    } catch (err: any) {
      setError(err?.message || "שגיאה בשליחה");
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    if (!portalUrl) return;
    await navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = portalUrl && project?.client_phone
    ? `https://wa.me/${project.client_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `שלום ${project.client_name || ""},\n\nמצורף שינוי חוזה לאישור:\n"${co?.title}"\n\nמחיר: ₪${Number(co?.price_amount ?? 0).toLocaleString("he-IL")}\n\nלצפייה ואישור:\n${portalUrl}\n\nבברכה`
      )}`
    : portalUrl
      ? `https://wa.me/?text=${encodeURIComponent(
          `שינוי חוזה לאישור:\n"${co?.title}"\n\nמחיר: ₪${Number(co?.price_amount ?? 0).toLocaleString("he-IL")}\n\nלצפייה ואישור:\n${portalUrl}`
        )}`
      : null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!co) {
    return <div className="p-6 text-center text-muted-foreground">שינוי לא נמצא</div>;
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">שליחה לאישור</h1>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <div className="flex items-start justify-between">
          <h2 className="font-bold text-lg">{co.title}</h2>
          <StatusBadge variant={co.status as any} />
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>קטגוריה: {categoryLabels[co.category] ?? co.category}</p>
          {co.description && <p className="line-clamp-2">{co.description}</p>}
        </div>

        <div className="flex gap-6 pt-2">
          <div className="text-center">
            <p className="text-2xl font-black">₪{Number(co.price_amount ?? 0).toLocaleString("he-IL")}</p>
            <p className="text-xs text-muted-foreground">
              {co.include_vat ? "כולל מע״מ" : "לפני מע״מ"}
            </p>
          </div>
          {(co.impact_days ?? 0) !== 0 && (
            <div className="text-center">
              <p className="text-2xl font-black text-accent">
                {co.impact_days! > 0 ? "+" : ""}{co.impact_days}
              </p>
              <p className="text-xs text-muted-foreground">ימי השפעה</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!portalToken ? (
        <div className="space-y-3">
          {co.status !== "priced" && co.status !== "draft" && (
            <p className="text-sm text-muted-foreground text-center">
              שינוי זה כבר נשלח — ניתן לשלוח שוב רק מסטטוס "תומחר"
            </p>
          )}
          <Button
            size="lg"
            className="w-full text-base font-semibold gap-2"
            onClick={handleSend}
            disabled={sending || co.status !== "priced"}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                שלח לאישור לקוח
              </>
            )}
          </Button>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-center space-y-1">
            <p className="font-semibold text-success">✓ קישור נוצר בהצלחה</p>
            <p className="text-xs text-muted-foreground">הקישור תקף ל-7 ימים</p>
          </div>

          <a
            href={whatsappUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-md
                       bg-[#25D366] text-white font-semibold text-base
                       transition-colors hover:bg-[#1DA851] active:bg-[#1A9648]"
          >
            <MessageCircle className="h-5 w-5" />
            שלח בוואטסאפ
          </a>

          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-success" />
                הועתק!
              </>
            ) : (
              <>
                <Copy className="h-5 w-5" />
                העתק קישור
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            חזור לפרויקט
          </Button>
        </div>
      )}
    </div>
  );
};

export default SendChange;
