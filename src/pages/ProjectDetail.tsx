import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Loader2, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChangeOrders } from "@/hooks/useChangeOrders";
import { ChangeOrderCard } from "@/components/changes/ChangeOrderCard";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/ui/status-badge";

// Demo data
const demoProjectsMap: Record<string, { name: string; address: string }> = {
  "demo-1": { name: "וילה כהן", address: "רחוב האלון 12, קיסריה" },
  "demo-2": { name: "דירת לוי", address: "שד' רוטשילד 45, תל אביב" },
};

const demoChangeOrders = [
  {
    id: "demo-co-1",
    title: "תוספת חדר ממ״ד",
    status: "approved",
    price_amount: 45000,
    category: "structural",
    created_at: "2024-12-15T10:00:00Z",
  },
  {
    id: "demo-co-2",
    title: "שדרוג מטבח",
    status: "sent",
    price_amount: 28000,
    category: "finishing",
    created_at: "2025-01-03T14:30:00Z",
  },
  {
    id: "demo-co-3",
    title: "ריצוף סלון",
    status: "draft",
    price_amount: 9200,
    category: "flooring",
    created_at: "2025-02-01T09:00:00Z",
  },
];

const statusLabels: Record<string, string> = {
  draft: "טיוטה",
  priced: "תומחר",
  sent: "נשלח",
  approved: "אושר",
  rejected: "נדחה",
  canceled: "בוטל",
};

const categoryLabels: Record<string, string> = {
  structural: "מבנה",
  electrical: "חשמל",
  plumbing: "אינסטלציה",
  finishing: "גמרים",
  flooring: "ריצוף",
  other: "אחר",
};

const isValidUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = !user;
  const validProjectId = projectId && isValidUuid(projectId) ? projectId : undefined;

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", validProjectId],
    enabled: !!validProjectId && !isDemo,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", validProjectId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: changeOrders, isLoading: coLoading } = useChangeOrders(isDemo ? "" : (validProjectId ?? ""));

  // Demo mode
  if (isDemo) {
    const demoProject = demoProjectsMap[projectId ?? ""] ?? { name: "פרויקט דוגמה", address: "" };

    return (
      <div dir="rtl" className="px-4 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/projects")} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{demoProject.name}</h1>
            {demoProject.address && <p className="text-sm text-muted-foreground truncate">{demoProject.address}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold">שינויים</h2>
          {demoChangeOrders.map((co) => (
            <button
              key={co.id}
              onClick={() => navigate(`/projects/${projectId}/changes/${co.id}`)}
              className="w-full text-right rounded-lg border bg-card p-4 space-y-2 transition-colors hover:border-primary/40 active:bg-muted"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-base">{co.title}</h3>
                <StatusBadge variant={co.status as any} />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{categoryLabels[co.category]}</span>
                <span>₪{co.price_amount.toLocaleString("he-IL")}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95"
          aria-label="שינוי חדש"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>
    );
  }

  // Real data
  if (projLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">פרויקט לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/projects")} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{project.name}</h1>
          {project.address && <p className="text-sm text-muted-foreground truncate">{project.address}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold">שינויים</h2>
        {coLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : changeOrders && changeOrders.length > 0 ? (
          changeOrders.map((co) => <ChangeOrderCard key={co.id} changeOrder={co} />)
        ) : (
          <div className="flex flex-col items-center py-12 text-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">אין שינויים עדיין — צור את הראשון</p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/projects/${projectId}/changes/new`)}
        className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95"
        aria-label="שינוי חדש"
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
};

export default ProjectDetail;
