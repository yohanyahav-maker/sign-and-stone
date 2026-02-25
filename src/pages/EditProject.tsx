import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Crown, MoreVertical, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/useSubscription";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: subscription } = useSubscription();
  const isPro = subscription?.plan === "pro";

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientPhone2, setClientPhone2] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPortalEnabled, setClientPortalEnabled] = useState(false);

  useEffect(() => {
    if (project) {
      setClientName(project.client_name ?? "");
      setClientPhone(project.client_phone ?? "");
      setClientPhone2((project as any).client_phone_2 ?? "");
      setClientEmail(project.client_email ?? "");
      setClientPortalEnabled(project.client_portal_enabled);
    }
  }, [project]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").update({
        client_name: clientName || null,
        client_phone: clientPhone || null,
        client_phone_2: clientPhone2 || null,
        client_email: clientEmail || null,
        client_portal_enabled: clientPortalEnabled,
      } as any).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("פרטי הלקוח עודכנו בהצלחה");
      navigate(`/projects/${id}`);
    },
    onError: () => toast.error("שגיאה בעדכון"),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("projects").delete().eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("הפרויקט נמחק");
      navigate("/projects");
    },
    onError: () => toast.error("שגיאה במחיקת הפרויקט"),
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!project) {
    return <div dir="rtl" className="p-6 text-center"><p className="text-muted-foreground">פרויקט לא נמצא</p></div>;
  }

  return (
    <div dir="rtl" className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/projects/${id}`)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-xl font-bold">פרטי לקוח</h1>
          {isPro && <Crown className="h-5 w-5 text-primary fill-primary" />}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary" aria-label="אפשרויות">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem className="text-destructive gap-2" onClick={() => {
              if (confirm("האם אתה בטוח שברצונך למחוק את הפרויקט?")) deleteMutation.mutate();
            }}>
              <Trash2 className="h-4 w-4" />
              מחק פרויקט
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        if (clientPortalEnabled && !clientName.trim()) { toast.error("שם לקוח חובה כשפורטל לקוח פעיל"); return; }
        if (clientPortalEnabled && !clientPhone.trim()) { toast.error("טלפון לקוח חובה כשפורטל לקוח פעיל"); return; }
        updateMutation.mutate();
      }} className="space-y-5">

        {/* Client details */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">שם לקוח {clientPortalEnabled && "*"}</Label>
            <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="שם מלא" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientPhone">טלפון {clientPortalEnabled && "*"}</Label>
            <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="050-0000000" dir="ltr" className="text-right" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientPhone2">טלפון 2</Label>
            <Input id="clientPhone2" value={clientPhone2} onChange={(e) => setClientPhone2(e.target.value)} placeholder="050-0000000" dir="ltr" className="text-right" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">אימייל</Label>
            <Input id="clientEmail" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@example.com" dir="ltr" className="text-right" />
          </div>
        </div>

        {/* Portal toggle */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">פורטל לקוח</h2>
              <p className="text-sm text-muted-foreground">אפשר ללקוח לאשר / לדחות שינויים</p>
            </div>
            <Switch checked={clientPortalEnabled} onCheckedChange={setClientPortalEnabled} />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "שמור"}
        </Button>
      </form>
    </div>
  );
};

export default EditProject;
