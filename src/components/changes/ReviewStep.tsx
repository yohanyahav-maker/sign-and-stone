import { useMemo } from "react";
import type { ChangeOrderDetails } from "@/components/changes/DetailsStep";
import type { ChangeOrderPricing } from "@/components/changes/PricingStep";
import { SlideToSend } from "@/components/changes/SlideToSend";
import { Button } from "@/components/ui/button";

const categoryLabels: Record<string, string> = {
  structural: "שלד ובטון", concrete: "יציקות", electrical: "חשמל",
  plumbing: "אינסטלציה", aluminum: "אלומיניום", kitchen: "מטבח",
  finishing: "גמרים", flooring: "ריצוף", painting: "צביעה",
  insulation: "איטום", hvac: "מיזוג", landscaping: "פיתוח חוץ",
  safety: "בטיחות", other: "אחר",
};

interface ReviewStepProps {
  details: ChangeOrderDetails;
  pricing: ChangeOrderPricing;
  filesCount: number;
  onSend: () => void;
  onSaveDraft: () => void;
  onBack: () => void;
  loading: boolean;
  clientEnabled: boolean;
}

export function ReviewStep({ details, pricing, filesCount, onSend, onSaveDraft, onBack, loading, clientEnabled }: ReviewStepProps) {
  const totalWithVat = useMemo(() => {
    if (!pricing.include_vat) return pricing.price_amount;
    return Math.round(pricing.price_amount * (1 + pricing.vat_rate / 100) * 100) / 100;
  }, [pricing]);

  const canSend = pricing.price_amount > 0 && clientEnabled;

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="rounded-[14px] bg-card p-6 space-y-5">
        <div>
          <p className="text-xs text-muted-foreground mb-1">כותרת</p>
          <p className="text-lg font-bold text-foreground">{details.title}</p>
        </div>

        <div className="flex gap-8">
          <div>
            <p className="text-xs text-muted-foreground mb-1">קטגוריה</p>
            <p className="text-sm font-medium text-foreground">
              {categoryLabels[details.category] ?? details.category}
            </p>
          </div>
          {filesCount > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">קבצים</p>
              <p className="text-sm font-medium text-foreground">{filesCount}</p>
            </div>
          )}
        </div>

        {details.description && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">תיאור</p>
            <p className="text-sm text-foreground leading-relaxed">{details.description}</p>
          </div>
        )}
      </div>

      {/* Pricing summary */}
      <div className="rounded-[14px] bg-card p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">מחיר</p>
            <p className="text-3xl font-black text-foreground">
              ₪{pricing.price_amount.toLocaleString("he-IL")}
            </p>
            {pricing.include_vat && pricing.price_amount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                כולל מע״מ: ₪{totalWithVat.toLocaleString("he-IL")}
              </p>
            )}
          </div>
          {pricing.impact_days !== 0 && (
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-1">ימי השפעה</p>
              <p className="text-2xl font-black text-foreground">
                {pricing.impact_days > 0 ? "+" : ""}{pricing.impact_days}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Slide to send */}
      {canSend ? (
        <SlideToSend
          onComplete={onSend}
          loading={loading}
          label="החלק לשליחה ללקוח"
        />
      ) : (
        <div className="text-center text-sm text-muted-foreground space-y-1">
          {pricing.price_amount <= 0 && <p>יש להזין מחיר לפני שליחה</p>}
          {!clientEnabled && <p>יש להפעיל פורטל לקוח בפרויקט</p>}
        </div>
      )}

      {/* Secondary actions */}
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onSaveDraft}
          disabled={loading}
        >
          {pricing.price_amount > 0 ? "שמור כתומחר" : "שמור כטיוטה"}
        </Button>
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          חזור לתמחור
        </Button>
      </div>
    </div>
  );
}
