import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Enums"]["change_order_category"];

const categoryOptions: { value: Category; label: string }[] = [
  { value: "structural", label: "מבנה" },
  { value: "electrical", label: "חשמל" },
  { value: "plumbing", label: "אינסטלציה" },
  { value: "finishing", label: "גמרים" },
  { value: "hvac", label: "מיזוג אוויר" },
  { value: "flooring", label: "ריצוף" },
  { value: "painting", label: "צביעה" },
  { value: "landscaping", label: "גינון" },
  { value: "safety", label: "בטיחות" },
  { value: "other", label: "אחר" },
];

const detailsSchema = z.object({
  title: z.string().trim().min(1, "כותרת נדרשת").max(150, "מקסימום 150 תווים"),
  category: z.enum([
    "structural", "electrical", "plumbing", "finishing", "hvac",
    "flooring", "painting", "landscaping", "safety", "other",
  ]),
  description: z.string().trim().max(2000, "מקסימום 2000 תווים").optional(),
});

export type ChangeOrderDetails = z.infer<typeof detailsSchema>;

interface DetailsStepProps {
  initial?: Partial<ChangeOrderDetails>;
  onNext: (data: ChangeOrderDetails) => void;
  onCancel: () => void;
}

export function DetailsStep({ initial, onNext, onCancel }: DetailsStepProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "other");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    setErrors({});
    const parsed = detailsSchema.safeParse({ title, category, description: description || undefined });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onNext(parsed.data);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="co-title">כותרת השינוי *</Label>
        <Input
          id="co-title"
          value={title}
          onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
          placeholder="למשל: הוספת נקודת חשמל במטבח"
          autoFocus
          maxLength={150}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>קטגוריה</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="co-desc">תיאור</Label>
        <Textarea
          id="co-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="פרט את השינוי המבוקש..."
          rows={4}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground text-left" dir="ltr">
          {description.length}/2000
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" size="lg" className="flex-1 font-semibold" onClick={handleNext}>
          המשך לתמחור
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </div>
  );
}
