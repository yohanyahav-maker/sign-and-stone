import { useState } from "react";
import { z } from "zod";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useCreateProject } from "@/hooks/useProjects";
import type { Database } from "@/integrations/supabase/types";

type ProjectType = Database["public"]["Enums"]["project_type"];

const projectTypeOptions: { value: ProjectType; label: string }[] = [
  { value: "villa", label: "וילה" },
  { value: "ground_attached", label: "צמוד קרקע" },
  { value: "advanced", label: "בנייה מתקדמת" },
  { value: "addition", label: "תוספת קומה" },
  { value: "renovation", label: "שיפוץ מקיף" },
];

const schema = z.object({
  name: z.string().trim().min(1, "שם הפרויקט נדרש").max(100, "מקסימום 100 תווים"),
  address: z.string().trim().max(200, "מקסימום 200 תווים").optional(),
  project_type: z.string(),
  client_portal_enabled: z.boolean(),
  client_name: z.string().trim().max(100).optional(),
  client_phone: z.string().trim().max(20).optional(),
  client_email: z.string().trim().email("אימייל לא תקין").max(255).optional().or(z.literal("")),
});

interface NewProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectSheet({ open, onOpenChange }: NewProjectSheetProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("villa");
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createProject = useCreateProject();

  const resetForm = () => {
    setName(""); setAddress(""); setProjectType("villa");
    setPortalEnabled(false); setClientName(""); setClientPhone(""); setClientEmail("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({
      name, address: address || undefined, project_type: projectType,
      client_portal_enabled: portalEnabled,
      client_name: clientName || undefined, client_phone: clientPhone || undefined,
      client_email: clientEmail || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => { if (e.path[0]) fieldErrors[e.path[0] as string] = e.message; });
      setErrors(fieldErrors);
      return;
    }

    try {
      await createProject.mutateAsync({
        name: parsed.data.name, address: parsed.data.address,
        project_type: parsed.data.project_type as ProjectType,
        client_portal_enabled: parsed.data.client_portal_enabled,
        client_name: parsed.data.client_name, client_phone: parsed.data.client_phone,
        client_email: parsed.data.client_email,
      });
      resetForm();
      onOpenChange(false);
    } catch {
      setErrors({ name: "שגיאה ביצירת הפרויקט" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>פרויקט בנייה חדש</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">שם הפרויקט *</Label>
            <Input id="proj-name" value={name} onChange={(e) => { setName(e.target.value); setErrors({}); }}
              placeholder="למשל: וילה כהן — קיסריה" autoFocus maxLength={100} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-address">כתובת האתר</Label>
            <Input id="proj-address" value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="רחוב, עיר" maxLength={200} />
          </div>

          <div className="space-y-1.5">
            <Label>סוג בנייה</Label>
            <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {projectTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="portal-toggle" className="text-sm font-medium cursor-pointer">
              הפעלת פורטל לקוח לאישור שינויים
            </Label>
            <Switch id="portal-toggle" checked={portalEnabled} onCheckedChange={setPortalEnabled} />
          </div>

          {portalEnabled && (
            <div className="space-y-4 rounded-lg border border-dashed p-3">
              <div className="space-y-1.5">
                <Label htmlFor="client-name">שם הלקוח (בעל הבית)</Label>
                <Input id="client-name" value={clientName} onChange={(e) => setClientName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-phone">טלפון לקוח</Label>
                <Input id="client-phone" type="tel" dir="ltr" value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)} placeholder="050-1234567" maxLength={20} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="client-email">אימייל לקוח</Label>
                <Input id="client-email" type="email" dir="ltr" value={clientEmail}
                  onChange={(e) => { setClientEmail(e.target.value); setErrors({}); }}
                  placeholder="client@example.com" maxLength={255} />
                {errors.client_email && <p className="text-sm text-destructive">{errors.client_email}</p>}
              </div>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={createProject.isPending}>
            {createProject.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "צור פרויקט"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
