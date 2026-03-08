import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Clock, Eraser } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const categoryLabels: Record<string, string> = {
  structural: "שלד ובטון", concrete: "יציקות", electrical: "חשמל",
  plumbing: "אינסטלציה", aluminum: "אלומיניום", kitchen: "מטבח",
  finishing: "גמרים", flooring: "ריצוף", painting: "צביעה",
  insulation: "איטום", hvac: "מיזוג", landscaping: "פיתוח חוץ",
  safety: "בטיחות", other: "אחר",
};

interface Attachment {
  id: string;
  file_name: string;
  file_type: string;
  context: string | null;
  signed_url: string;
}

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
  attachments: Attachment[];
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

  const [clientName, setClientName] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const sigRef = useRef<SignatureCanvas | null>(null);
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

  const handleClearSignature = () => {
    sigRef.current?.clear();
    setHasSigned(false);
  };

  const handleSignEnd = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      setHasSigned(true);
    }
  };

  const handleApprove = async () => {
    setError("");
    if (!clientName.trim()) { setError("נא להזין שם מלא"); return; }
    if (clientName.trim().length > 100) { setError("שם ארוך מדי"); return; }
    if (!hasSigned || !sigRef.current || sigRef.current.isEmpty()) {
      setError("נא לחתום לפני האישור");
      return;
    }

    setState("submitting");
    const signatureData = sigRef.current.toDataURL("image/png");

    const { data: resp, error: fnError } = await supabase.functions.invoke("client-respond", {
      body: {
        token,
        client_name: clientName.trim(),
        action: "approved",
        signature_data: signatureData,
      },
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
        message="הקישור אינו פעיל יותר. בקש מנותן השירות לשלוח קישור חדש."
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
        message="תודה! אישורך נרשם בהצלחה. נותן השירות יקבל הודעה."
        showBranding
      />
    );
  }

  if (state === "rejected") {
    return (
      <StatusScreen
        icon={<XCircle className="h-12 w-12 text-destructive" />}
        title="השינוי נדחה"
        message="הדחייה נרשמה. נותן השירות יקבל הודעה עם סיבת הדחייה."
      />
    );
  }

  // ─── Ready / Submitting ───
  const co = data!.change_order;
  const totalPrice = co.include_vat && co.price_amount
    ? Math.round(Number(co.price_amount) * (1 + co.vat_rate / 100) * 100) / 100
    : Number(co.price_amount ?? 0);

  const beforePhotos = (data!.attachments ?? []).filter(
    (a) => a.context === "BEFORE" && a.file_type === "image"
  );
  const afterPhotos = (data!.attachments ?? []).filter(
    (a) => a.context === "AFTER" && a.file_type === "image"
  );
  const hasComparison = beforePhotos.length > 0 || afterPhotos.length > 0;

  const canApprove = clientName.trim().length > 0 && hasSigned && state !== "submitting";

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

        {/* Before / After Comparison */}
        {hasComparison && (
          <div className="rounded-xl bg-card border border-border shadow-sm p-4 space-y-3">
            <h2 className="text-sm font-bold text-center text-muted-foreground">השוואה ויזואלית</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* BEFORE */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-center text-muted-foreground">מצב קיים (לפני)</p>
                {beforePhotos.length > 0 ? (
                  beforePhotos.map((photo) => (
                    <div key={photo.id} className="aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
                      <img
                        src={photo.signed_url}
                        alt={photo.file_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground/50">אין תמונה</p>
                  </div>
                )}
              </div>
              {/* AFTER */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-center text-primary">השינוי המבוקש (אחרי)</p>
                {afterPhotos.length > 0 ? (
                  afterPhotos.map((photo) => (
                    <div key={photo.id} className="aspect-[4/3] overflow-hidden rounded-xl border-2 border-primary/40">
                      <img
                        src={photo.signed_url}
                        alt={photo.file_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center rounded-xl bg-secondary">
                    <p className="text-xs text-muted-foreground/50">אין תמונה</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Change Order Card */}
        <div className="rounded-xl bg-card border border-primary/30 shadow-sm p-6 space-y-5">
          <h1 className="text-xl font-bold text-center">{co.title}</h1>

          <p className="text-sm text-muted-foreground text-center">
            {categoryLabels[co.category] ?? co.category}
          </p>

          <div className="text-center py-4">
            <p className="text-[42px] font-black leading-none tabular-nums text-primary font-display">
              ₪{totalPrice.toLocaleString("he-IL")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {co.include_vat ? `כולל מע״מ ${co.vat_rate}%` : "לפני מע״מ"}
            </p>
          </div>

          {(co.impact_days ?? 0) !== 0 && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-lg font-bold text-warning bg-warning/10 border border-warning/25">
                {co.impact_days! > 0 ? "+" : ""}{co.impact_days} ימים
              </span>
              <p className="text-xs text-muted-foreground mt-1">השפעה על לוח זמנים</p>
            </div>
          )}

          {co.description && (
            <div className="pt-4 border-t border-border">
              <p className="text-[15px] leading-relaxed">{co.description}</p>
            </div>
          )}
        </div>

        {/* Legal text */}
        <div className="rounded-xl p-4 bg-secondary border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            באישור שינוי זה, אני מאשר/ת כי קראתי והבנתי את פרטי השינוי, המחיר וההשפעה על לוח הזמנים,
            ואני מסכים/ה לתנאים המפורטים לעיל. אישור זה מהווה חתימה דיגיטלית מחייבת.
          </p>
        </div>

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

          {/* Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>חתימה דיגיטלית *</Label>
              <button
                type="button"
                onClick={handleClearSignature}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eraser className="h-3.5 w-3.5" />
                נקה
              </button>
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: hasSigned ? '2px solid hsl(var(--success))' : '1px solid hsl(var(--border))',
                background: '#FFFFFF',
              }}
            >
              <SignatureCanvas
                ref={sigRef}
                penColor="#0A0A0A"
                canvasProps={{
                  className: "w-full",
                  style: { width: "100%", height: 160, touchAction: "none" },
                }}
                onEnd={handleSignEnd}
              />
            </div>
            <p className="text-[11px] text-muted-foreground text-center">חתום באמצעות האצבע או העכבר</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            size="lg"
            className="w-full text-base font-extrabold h-[60px] bg-success text-success-foreground hover:bg-success/90"
            onClick={handleApprove}
            disabled={!canApprove}
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
            className="w-full bg-destructive/10 text-destructive border-destructive/25 hover:bg-destructive/20"
            onClick={() => setShowRejectModal(true)}
            disabled={state === "submitting"}
          >
            דחה שינוי
          </Button>
        </div>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-card border-t border-border p-6 space-y-4 animate-in slide-in-from-bottom shadow-2xl">
              <div className="w-9 h-1 rounded-full mx-auto mb-2 bg-muted-foreground/30" />
              <h2 className="text-lg font-extrabold">דחיית שינוי</h2>
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
        <div className="text-center pt-4 pb-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs text-muted-foreground">
            מופעל ע״י <span className="font-display">שינוי <span className="text-primary">חתום</span></span>
          </p>
        </div>
      </div>
    </div>
  );
};

function StatusScreen({ icon, title, message, showBranding }: { icon: React.ReactNode; title: string; message: string; showBranding?: boolean }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center space-y-4 max-w-sm">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        {showBranding && (
          <div className="pt-5 space-y-1">
            <p className="text-xs text-muted-foreground/70">שינוי זה אושר ונחתם דיגיטלית</p>
            <p className="text-xs text-muted-foreground/70">
              באמצעות{" "}
              <a
                href="https://sign-and-stone.lovable.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-primary hover:underline"
              >
                שינוי חתום
              </a>
            </p>
          </div>
        )}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground/50">
            מופעל ע״י <span className="font-display">שינוי <span className="text-primary">חתום</span></span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ClientPortal;