import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { Database } from "@/integrations/supabase/types";

type ProjectType = Database["public"]["Enums"]["project_type"];

const projectTypeLabels: Record<ProjectType, string> = {
  villa: "וילה",
  ground_attached: "קרקע מחוברת",
  advanced: "מתקדם",
  addition: "תוספת בנייה",
  residential: "מגורים",
  commercial: "מסחרי",
  renovation: "שיפוץ",
  infrastructure: "תשתית",
  other: "אחר",
};

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("residential");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPortalEnabled, setClientPortalEnabled] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setAddress(project.address ?? "");
      setProjectType(project.project_type);
      setClientName(project.client_name ?? "");
      setClientPhone(project.client_phone ?? "");
      setClientEmail(project.client_email ?? "");
      setClientPortalEnabled(project.client_portal_enabled);
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({
          name,
          address: address || null,
          project_type: projectType,
          client_name: clientName || null,
          client_phone: clientPhone || null,
          client_email: clientEmail || null,
          client_portal_enabled: clientPortalEnabled,
        })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("הפרויקט עודכן בהצלחה");
      navigate(`/projects/${id}`);
    },
    onError: () => {
      toast.error("שגיאה בעדכון הפרויקט");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div dir="rtl" className="p-6 text-center">
        <p className="text-muted-foreground">פרויקט לא נמצא</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/projects/${id}`)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">עריכת פרויקט</h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) { toast.error("שם פרויקט הוא שדה חובה"); return; }
          if (clientPortalEnabled && !clientName.trim()) { toast.error("שם לקוח חובה כשפורטל לקוח פעיל"); return; }
          if (clientPortalEnabled && !clientPhone.trim()) { toast.error("טלפון לקוח חובה כשפורטל לקוח פעיל"); return; }
          updateMutation.mutate();
        }}
        className="space-y-5"
      >
        {/* Project details */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="text-base font-bold">פרטי פרויקט</h2>

          <div className="space-y-1.5">
            <Label htmlFor="name">שם הפרויקט *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="שם הפרויקט" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">כתובת</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="כתובת הפרויקט" />
          </div>

          <div className="space-y-1.5">
            <Label>סוג פרויקט</Label>
            <Select value={projectType} onValueChange={(v) => setProjectType(v as ProjectType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(projectTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client details */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="text-base font-bold">פרטי לקוח</h2>

          <div className="space-y-1.5">
            <Label htmlFor="clientName">שם הלקוח {clientPortalEnabled && "*"}</Label>
            <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="שם מלא" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientPhone">טלפון {clientPortalEnabled && "*"}</Label>
            <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="050-0000000" dir="ltr" className="text-right" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">אימייל</Label>
            <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@example.com" dir="ltr" className="text-right" />
          </div>
        </div>

        {/* Portal */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">פורטל לקוח</h2>
              <p className="text-sm text-muted-foreground">אפשר ללקוח לאשר/לדחות שינויים</p>
            </div>
            <Switch checked={clientPortalEnabled} onCheckedChange={setClientPortalEnabled} />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "שמור שינויים"}
        </Button>
      </form>
    </div>
  );
};

export default EditProject;
