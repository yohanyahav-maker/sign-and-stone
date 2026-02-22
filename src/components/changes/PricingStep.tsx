import { useState, useMemo } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Minus, Plus, Loader2 } from "lucide-react";

const pricingSchema = z.object({
  price_amount: z.number().min(0, "מחיר לא יכול להיות שלילי").max(99999999, "מחיר גבוה מדי"),
  include_vat: z.boolean(),
  vat_rate: z.number(),
  impact_days: z.number().int().min(-365).max(365),
});

export type ChangeOrderPricing = z.infer<typeof pricingSchema>;

interface PricingStepProps {
  initial?: Partial<ChangeOrderPricing>;
  onSubmit: (data: ChangeOrderPricing, asDraft: boolean) => void;
  onBack: () => void;
  loading: boolean;
}

export function PricingStep({ initial, onSubmit, onBack, loading }: PricingStepProps) {
  const [priceStr, setPriceStr] = useState(initial?.price_amount?.toString() ?? "");
  const [includeVat, setIncludeVat] = useState(initial?.include_vat ?? true);
  const [impactDays, setImpactDays] = useState(initial?.impact_days ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vatRate = 17;
  const priceNum = parseFloat(priceStr) || 0;

  const totalWithVat = useMemo(() => {
    if (!includeVat) return priceNum;
    return Math.round(priceNum * (1 + vatRate / 100) * 100) / 100;
  }, [priceNum, includeVat, vatRate]);

  const handleSubmit = (asDraft: boolean) => {
    setErrors({});
    const parsed = pricingSchema.safeParse({
      price_amount: priceNum,
      include_vat: includeVat,
      vat_rate: vatRate,
      impact_days: impactDays,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onSubmit(parsed.data, asDraft);
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="co-price">מחיר (₪)</Label>
        <div className="relative">
          <Input
            id="co-price"
            type="number"
            inputMode="decimal"
            dir="ltr"
            value={priceStr}
            onChange={(e) => { setPriceStr(e.target.value); setErrors({}); }}
            placeholder="0.00"
            className="text-center text-[40px] font-black h-20 pr-12"
            min={0}
            step="0.01"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
            ₪
          </span>
        </div>
        {errors.price_amount && <p className="text-sm text-destructive">{errors.price_amount}</p>}
      </div>

      {/* VAT toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="vat-toggle" className="text-sm font-medium cursor-pointer">
            כולל מע״מ ({vatRate}%)
          </Label>
          {includeVat && priceNum > 0 && (
            <p className="text-xs text-muted-foreground">
              סה״כ כולל מע״מ: ₪{totalWithVat.toLocaleString("he-IL")}
            </p>
          )}
        </div>
        <Switch
          id="vat-toggle"
          checked={includeVat}
          onCheckedChange={setIncludeVat}
        />
      </div>

      {/* Impact days */}
      <div className="space-y-2">
        <Label>ימי השפעה על לוח זמנים</Label>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setImpactDays((d) => Math.max(-365, d - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-card
                       transition-colors active:bg-muted"
          >
            <Minus className="h-5 w-5" />
          </button>
          <span className="text-3xl font-bold w-20 text-center tabular-nums">
            {impactDays > 0 ? `+${impactDays}` : impactDays}
          </span>
          <button
            type="button"
            onClick={() => setImpactDays((d) => Math.min(365, d + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-card
                       transition-colors active:bg-muted"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center">ימים</p>
        {errors.impact_days && <p className="text-sm text-destructive text-center">{errors.impact_days}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="button"
          size="lg"
          className="w-full text-base font-semibold"
          onClick={() => handleSubmit(false)}
          disabled={loading || priceNum <= 0}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "שמור ותמחר"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => handleSubmit(true)}
          disabled={loading}
        >
          שמור כטיוטה
        </Button>
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          חזור לפרטים
        </Button>
      </div>
    </div>
  );
}
