import { useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploadZone, type LocalFile } from "@/components/changes/FileUploadZone";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Enums"]["change_order_category"];

const categoryOptions: { value: Category; label: string }[] = [
  { value: "structural", label: "שלד ובטון" },
  { value: "concrete", label: "יציקות ותבניות" },
  { value: "electrical", label: "חשמל" },
  { value: "plumbing", label: "אינסטלציה" },
  { value: "aluminum", label: "אלומיניום וחלונות" },
  { value: "kitchen", label: "מטבח" },
  { value: "finishing", label: "גמרים" },
  { value: "flooring", label: "ריצוף וחיפוי" },
  { value: "painting", label: "צביעה וטיח" },
  { value: "insulation", label: "איטום ובידוד" },
  { value: "hvac", label: "מיזוג אוויר" },
  { value: "landscaping", label: "פיתוח חוץ וגינון" },
  { value: "safety", label: "בטיחות" },
  { value: "other", label: "אחר" },
];

const detailsSchema = z.object({
  title: z.string().trim().min(1, "כותרת נדרשת").max(150, "מקסימום 150 תווים"),
  category: z.string(),
  description: z.string().trim().max(2000, "מקסימום 2000 תווים").optional(),
});

export type ChangeOrderDetails = z.infer<typeof detailsSchema>;

interface DetailsStepProps {
  initial?: Partial<ChangeOrderDetails>;
  initialFiles?: LocalFile[];
  onNext: (data: ChangeOrderDetails, files: LocalFile[]) => void;
  onCancel: () => void;
}

export function DetailsStep({ initial, initialFiles, onNext, onCancel }: DetailsStepProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Category>((initial?.category as Category) ?? "structural");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [files, setFiles] = useState<LocalFile[]>(initialFiles ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    setErrors({});
    const parsed = detailsSchema.safeParse({ title, category, description: description || undefined });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { if (e.path[0]) fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }
    onNext(parsed.data, files);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="co-title" className="text-xs text-muted-foreground">כותרת</Label>
        <Input id="co-title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors({}); }}
          placeholder="למשל: תוספת נקודת חשמל בסלון" autoFocus maxLength={150}
          className="h-12 text-base rounded-[14px]" />
        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">קטגוריה</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="h-12 rounded-[14px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {categoryOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="co-desc" className="text-xs text-muted-foreground">תיאור</Label>
        <Textarea id="co-desc" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="מה משתנה, היכן באתר..." rows={3} maxLength={2000}
          className="rounded-[14px] text-base" />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">קבצים</Label>
        <FileUploadZone files={files} onChange={setFiles} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" size="lg" className="flex-1 font-semibold h-14 text-base" onClick={handleNext}>
          המשך
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onCancel} className="h-14">
          ביטול
        </Button>
      </div>
    </div>
  );
}
