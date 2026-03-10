import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Copy, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChangeOrder } from "@/hooks/useChangeOrders";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SlideToSend } from "@/components/changes/SlideToSend";

import { CATEGORY_LABELS as categoryLabels } from "@/lib/constants";

const SendChange = () => {
  const { projectId, changeId } = useParams<{ projectId: string; changeId: string }>();
  const navigate = useNavigate();
  const { data: co, isLoading } = useChangeOrder(changeId!);
  const [sending, setSending] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
        `שלום ${project.client_name || ""},\n\nמצורף שינוי לאישור:\n"${co?.title}"\n\nמחיר: ₪${Number(co?.price_amount ?? 0).toLocaleString("he-IL")}\n\nלצפייה ואישור:\n${portalUrl}\n\nבברכה`
      )}`
    : portalUrl
      ? `https://wa.me/?text=${encodeURIComponent(
          `שינוי לאישור:\n"${co?.title}"\n\nמחיר: ₪${Number(co?.price_amount ?? 0).toLocaleString("he-IL")}\n\nלצפייה ואישור:\n${portalUrl}`
        )}`
      : null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!co) {
    return <div className="p-6 text-center text-muted-foreground">שינוי לא נמצא</div>;
  }

  return (
    <div dir="rtl" className="px-5 py-8 space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          style={{ border: '1px solid var(--border-default)' }}
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">שליחה לאישור</h1>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl bg-card p-6 space-y-4" style={{ border: '1px solid var(--border-default)' }}>
        <h2 className="font-bold text-lg">{co.title}</h2>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>{categoryLabels[co.category] ?? co.category}</p>
          {co.description && <p className="line-clamp-2">{co.description}</p>}
        </div>

        <div className="flex gap-8 pt-2">
          <div>
            <p className="text-3xl font-black">₪{Number(co.price_amount ?? 0).toLocaleString("he-IL")}</p>
            <p className="text-xs text-muted-foreground">
              {co.include_vat ? "כולל מע״מ" : "לפני מע״מ"}
            </p>
          </div>
          {(co.impact_days ?? 0) !== 0 && (
            <div>
              <p className="text-3xl font-black">
                {co.impact_days! > 0 ? "+" : ""}{co.impact_days} ימים
              </p>
              <p className="text-xs text-muted-foreground">השפעה על לוח זמנים</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!portalToken ? (
        <div className="space-y-4">
          {co.status === "priced" ? (
            <SlideToSend
              onComplete={handleSend}
              loading={sending}
              label="החלק לשליחה ללקוח"
            />
          ) : co.status === "draft" ? (
            <p className="text-sm text-muted-foreground text-center">
              יש לתמחר את השינוי לפני שליחה
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              שינוי זה כבר נשלח
            </p>
          )}
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[14px] bg-card border border-border p-5 text-center space-y-1">
            <p className="font-semibold text-foreground">✓ קישור נוצר בהצלחה</p>
            <p className="text-xs text-muted-foreground">הקישור תקף ל-7 ימים</p>
          </div>

          <a
            href={whatsappUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-14 rounded-[14px]
                       bg-[#25D366] text-white font-semibold text-base
                       transition-colors hover:bg-[#1DA851] active:bg-[#1A9648]"
          >
            <MessageCircle className="h-5 w-5" />
            שלח בוואטסאפ
          </a>

          <Button
            variant="outline"
            size="lg"
            className="w-full h-14 gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-5 w-5" />
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
