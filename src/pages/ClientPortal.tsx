import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categoryLabels: Record<string, string> = {
  structural: "שלד ובטון", concrete: "יציקות", electrical: "חשמל",
  plumbing: "אינסטלציה", aluminum: "אלומיניום", kitchen: "מטבח",
  finishing: "גמרים", flooring: "ריצוף", painting: "צביעה",
  insulation: "איטום", hvac: "מיזוג", landscaping: "פיתוח חוץ",
  safety: "בטיחות", other: "אחר",
};

interface PortalData {
  change_order: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    price_amount: number | null;
    include_vat: boolean;
    vat_rate: number;
    impact_days: number | null;
    status: string;
  };
  project_name: string;
  contractor_name: string;
  contractor_logo: string;
}

type PortalState = "loading" | "ready" | "submitting" | "approved" | "rejected" | "already_used" | "expired" | "invalid";

const ClientPortal = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<PortalState>("loading");
  const [data, setData] = useState<PortalData | null>(null);
  const [existingStatus, setExistingStatus] = useState<string>("");

  // Form state
  const [clientName, setClientName] = useState("");
  const [consent, setConsent] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }

    supabase.functions
      .invoke("validate-portal-token", { body: { token } })
      .then(({ data: respData, error: fnError }) => {
        if (fnError || respData?.error) {
          const errType = respData?.error;
          if (errType === "already_used") {
            setExistingStatus(respData?.status || "");
            setState("already_used");
          } else if (errType === "expired") {
            setState("expired");
          } else {
            setState("invalid");
          }
          return;
        }
        setData(respData);
        setState("ready");
      });
  }, [token]);

  const handleApprove = async () => {
    setError("");
    if (!clientName.trim()) { setError("נא להזין שם מלא"); return; }
    if (clientName.trim().length > 100) { setError("שם ארוך מדי"); return; }
    if (!consent) { setError("נא לאשר את תנאי ההסכמה"); return; }

    setState("submitting");
    const { data: resp, error: fnError } = await supabase.functions.invoke("client-respond", {
      body: { token, client_name: clientName.trim(), action: "approved" },
    });

    if (fnError || resp?.error) {
      setError(resp?.message || "שגיאה. נסה שוב.");
      setState("ready");
      return;
    }
    setState("approved");
  };

  const handleReject = async () => {
    setError("");
    if (!clientName.trim()) { setError("נא להזין שם מלא"); return; }
    if (!rejectReason.trim()) { setError("נא לציין סיבת דחייה"); return; }

    setState("submitting");
    const { data: resp, error: fnError } = await supabase.functions.invoke("client-respond", {
      body: {
        token,
        client_name: clientName.trim(),
        action: "rejected",
        rejection_reason: rejectReason.trim(),
      },
    });

    if (fnError || resp?.error) {
      setError(resp?.message || "שגיאה. נסה שוב.");
      setState("ready");
      return;
    }
    setState("rejected");
  };

  // ─── Loading ───
  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // ─── Error states ───
  if (state === "invalid") {
    return (
      <StatusScreen
        icon={<AlertTriangle className="h-12 w-12 text-destructive" />}
        title="קישור לא תקין"
        message="הקישור שגוי או שלא נמצא שינוי חוזה מתאים."
      />
    );
  }

  if (state === "expired") {
    return (
      <StatusScreen
        icon={<Clock className="h-12 w-12 text-muted-foreground" />}
        title="קישור פג תוקף"
        message="הקישור אינו פעיל יותר. בקש מהקבלן לשלוח קישור חדש."
      />
    );
  }

  if (state === "already_used") {
    return (
      <StatusScreen
        icon={existingStatus === "approved"
          ? <CheckCircle className="h-12 w-12 text-success" />
          : <XCircle className="h-12 w-12 text-destructive" />}
        title="כבר טופל"
        message={existingStatus === "approved"
          ? "שינוי זה כבר אושר."
          : existingStatus === "rejected"
            ? "שינוי זה כבר נדחה."
            : "שינוי זה כבר טופל."}
      />
    );
  }

  // ─── Success states ───
  if (state === "approved") {
    return (
      <StatusScreen
        icon={<CheckCircle className="h-12 w-12 text-success" />}
        title="השינוי אושר!"
        message="תודה! אישורך נרשם בהצלחה. הקבלן יקבל הודעה."
      />
    );
  }

  if (state === "rejected") {
    return (
      <StatusScreen
        icon={<XCircle className="h-12 w-12 text-destructive" />}
        title="השינוי נדחה"
        message="הדחייה נרשמה. הקבלן יקבל הודעה עם סיבת הדחייה."
      />
    );
  }

  // ─── Ready / Submitting ───
  const co = data!.change_order;
  const totalPrice = co.include_vat && co.price_amount
    ? Math.round(Number(co.price_amount) * (1 + co.vat_rate / 100) * 100) / 100
    : Number(co.price_amount ?? 0);

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        {/* Header */}
        {data!.contractor_logo && (
          <div className="flex justify-center">
            <img
              src={data!.contractor_logo}
              alt={data!.contractor_name}
              className="h-12 object-contain"
            />
          </div>
        )}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">{data!.contractor_name}</p>
          <p className="text-xs text-muted-foreground">{data!.project_name}</p>
        </div>

        {/* Change Order Card */}
        <div className="rounded-xl border bg-card p-6 space-y-5">
          <h1 className="text-xl font-bold text-center">{co.title}</h1>

          <p className="text-sm text-muted-foreground text-center">
            {categoryLabels[co.category] ?? co.category}
          </p>

          {/* Price — decision point */}
          <div className="text-center py-4">
            <p className="text-[42px] font-black leading-none tabular-nums">
              ₪{totalPrice.toLocaleString("he-IL")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {co.include_vat ? `כולל מע״מ ${co.vat_rate}%` : "לפני מע״מ"}
            </p>
          </div>

          {/* Impact days */}
          {(co.impact_days ?? 0) !== 0 && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-4 py-2 text-lg font-bold text-accent">
                {co.impact_days! > 0 ? "+" : ""}{co.impact_days} ימים
              </span>
              <p className="text-xs text-muted-foreground mt-1">השפעה על לוח זמנים</p>
            </div>
          )}

          {/* Description */}
          {co.description && (
            <div className="border-t pt-4">
              <p className="text-sm leading-relaxed">{co.description}</p>
            </div>
          )}
        </div>

        {/* Legal text */}
        <p className="text-xs text-muted-foreground leading-relaxed text-center px-4">
          באישור שינוי זה, אני מאשר/ת כי קראתי והבנתי את פרטי השינוי, המחיר וההשפעה על לוח הזמנים,
          ואני מסכים/ה לתנאים המפורטים לעיל. אישור זה מהווה חתימה דיגיטלית מחייבת.
        </p>

        {/* Approve form */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="client-name">שם מלא *</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => { setClientName(e.target.value); setError(""); }}
              placeholder="שם פרטי ומשפחה"
              maxLength={100}
              disabled={state === "submitting"}
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(v) => { setConsent(v === true); setError(""); }}
              disabled={state === "submitting"}
              className="mt-0.5"
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              אני מאשר/ת שקראתי את פרטי השינוי ומסכים/ה לתנאים
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            size="lg"
            className="w-full text-base font-semibold bg-success hover:bg-success/90 text-success-foreground"
            onClick={handleApprove}
            disabled={!clientName.trim() || !consent || state === "submitting"}
          >
            {state === "submitting" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "✓ חתום ואשר"
            )}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setShowRejectModal(true)}
            disabled={state === "submitting"}
          >
            דחה שינוי
          </Button>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
            <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-background p-6 space-y-4 animate-in slide-in-from-bottom">
              <h2 className="text-lg font-bold">דחיית שינוי</h2>
              <div className="space-y-1.5">
                <Label htmlFor="reject-reason">סיבת הדחייה *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="נא לפרט את סיבת הדחייה..."
                  rows={4}
                  maxLength={1000}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || state === "submitting"}
                >
                  {state === "submitting" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "אשר דחייה"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => { setShowRejectModal(false); setError(""); }}
                  disabled={state === "submitting"}
                >
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 pb-8 border-t">
          <p className="text-xs text-muted-foreground">
            מופעל ע״י <span className="font-semibold">שינוי חתום</span>
          </p>
        </div>
      </div>
    </div>
  );
};

function StatusScreen({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            מופעל ע״י <span className="font-semibold">שינוי חתום</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientPortal;
