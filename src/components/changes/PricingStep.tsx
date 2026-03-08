import { useState, useMemo } from "react";
import { z } from "zod";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { he } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const pricingSchema = z.object({
  price_amount: z.number().min(0, "מחיר לא יכול להיות שלילי").max(99999999, "מחיר גבוה מדי"),
  include_vat: z.boolean(),
  vat_rate: z.number(),
  impact_days: z.number().int().min(-365).max(365),
});

export type ChangeOrderPricing = z.infer<typeof pricingSchema>;

interface PricingStepProps {
  initial?: Partial<ChangeOrderPricing>;
  onNext: (data: ChangeOrderPricing) => void;
  onSaveDraft: () => void;
  onBack: () => void;
  loading: boolean;
}

export function PricingStep({ initial, onNext, onSaveDraft, onBack, loading }: PricingStepProps) {
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

  const validate = (): ChangeOrderPricing | null => {
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
      return null;
    }
    return parsed.data;
  };

  const handleNext = () => {
    const data = validate();
    if (data) onNext(data);
  };

  return (
    <div className="space-y-8">
      {/* Price */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">מחיר (₪)</Label>
        <div className="relative">
          <Input
            type="number"
            inputMode="decimal"
            dir="ltr"
            value={priceStr}
            onChange={(e) => { setPriceStr(e.target.value); setErrors({}); }}
            placeholder="0"
            className="text-center text-[44px] font-black h-24 rounded-[14px] pr-14"
            min={0}
            step="0.01"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
            ₪
          </span>
        </div>
        {errors.price_amount && <p className="text-sm text-destructive">{errors.price_amount}</p>}
      </div>

      {/* VAT toggle */}
      <div className="flex items-center justify-between rounded-[14px] bg-card p-4">
        <div className="space-y-0.5">
          <Label htmlFor="vat-toggle" className="text-sm font-medium cursor-pointer">
            כולל מע״מ ({vatRate}%)
          </Label>
          {includeVat && priceNum > 0 && (
            <p className="text-xs text-muted-foreground">
              סה״כ: ₪{totalWithVat.toLocaleString("he-IL")}
            </p>
          )}
        </div>
        <Switch id="vat-toggle" checked={includeVat} onCheckedChange={setIncludeVat} />
      </div>

      {/* Schedule Impact */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">השפעה על לוח זמנים</Label>
        <div className="rounded-[14px] bg-card p-4 space-y-3">
          <Label className="text-sm font-medium">תאריך מסירה חדש</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 rounded-[14px] justify-start text-right font-normal",
                  !deliveryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="ml-2 h-4 w-4 opacity-60" />
                {deliveryDate
                  ? format(deliveryDate, "dd/MM/yyyy", { locale: he })
                  : "בחר תאריך מסירה חדש"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deliveryDate}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {deliveryDate && (
            <p className="text-sm text-center font-semibold tabular-nums">
              {impactDays > 0
                ? `+${impactDays} ימים`
                : impactDays === 0
                ? "ללא שינוי"
                : `${impactDays} ימים`}
            </p>
          )}
        </div>
        {errors.impact_days && <p className="text-sm text-destructive text-center">{errors.impact_days}</p>}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-4">
        <Button
          type="button"
          size="lg"
          className="w-full text-base font-semibold h-14"
          onClick={handleNext}
        >
          המשך לסיכום
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full h-14"
          onClick={onSaveDraft}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "שמור כטיוטה"}
        </Button>
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          חזור
        </Button>
      </div>
    </div>
  );
}
