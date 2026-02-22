import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProjects, useProjectChangeOrderCounts } from "@/hooks/useProjects";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner } from "@/components/projects/SubscriptionBanner";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyProjects } from "@/components/projects/EmptyProjects";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";

// Demo data
const demoProjects = [
  {
    id: "demo-1",
    name: "וילה כהן",
    address: "רחוב האלון 12, קיסריה",
    project_type: "villa" as const,
    pending: 3,
    approvedSum: 82000,
  },
  {
    id: "demo-2", name: "תוספת קומה — לוי", address: "הרצליה",
    project_type: "addition" as const, pending: 1, approvedSum: 24000,
  },
];

const projectTypeLabels: Record<string, string> = {
  villa: "וילה", ground_attached: "צמוד קרקע", advanced: "בנייה מתקדמת",
  addition: "תוספת קומה", renovation: "שיפוץ מקיף",
  residential: "מגורים", commercial: "מסחרי", infrastructure: "תשתיות", other: "אחר",
};

const Projects = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = !user;

  // Real data hooks (only when logged in)
  const { data: profile } = useProfile();
  const { data: projects, isLoading } = useProjects();
  const { data: subscription } = useSubscription();
  const projectIds = projects?.map((p) => p.id) ?? [];
  const { data: counts } = useProjectChangeOrderCounts(projectIds);

  const displayName = isDemo ? "קבלן" : (profile?.full_name || profile?.company_name || "קבלן");

  if (isDemo) {
    return (
      <div dir="rtl" className="px-4 py-6 space-y-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">שלום, קבלן 👋</h1>
          <p className="text-sm text-muted-foreground">
            יש לך <span className="text-accent font-semibold">4</span> שינויים ממתינים לאישור
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">הפרויקטים שלי</h2>
            <span className="text-sm text-muted-foreground">2/3</span>
          </div>
          {demoProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="w-full text-right rounded-lg border bg-card p-4 space-y-3 transition-colors hover:border-primary/40 active:bg-muted"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{p.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{p.address}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0">
                  {projectTypeLabels[p.project_type]}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {p.pending > 0 && (
                  <span className="flex items-center gap-1 text-accent font-medium">
                    <Clock className="h-4 w-4" />
                    {p.pending} ממתינים
                  </span>
                )}
                {p.approvedSum > 0 && (
                  <span className="flex items-center gap-1 text-success font-medium">
                    <CheckCircle className="h-4 w-4" />
                    ₪{p.approvedSum.toLocaleString("he-IL")}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95"
          aria-label="פרויקט חדש"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>
    );
  }

  // Real data rendering
  const totalPending = projectIds.reduce((sum, id) => sum + (counts?.[id]?.pending ?? 0), 0);
  const atLimit = subscription && projects ? projects.length >= subscription.project_limit : false;

  return (
    <div className="px-4 py-6 space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">שלום, {displayName} 👋</h1>
        {totalPending > 0 && (
          <p className="text-sm text-muted-foreground">
            יש לך <span className="text-accent font-semibold">{totalPending}</span> שינויים ממתינים לאישור
          </p>
        )}
      </div>
      <SubscriptionBanner />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">הפרויקטים שלי</h2>
            <span className="text-sm text-muted-foreground">{projects.length}/{subscription?.project_limit ?? "∞"}</span>
          </div>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} counts={counts?.[project.id]} />
          ))}
        </div>
      ) : (
        <EmptyProjects />
      )}
      <button
        onClick={() => { if (!atLimit) setSheetOpen(true); }}
        disabled={atLimit}
        className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="פרויקט חדש"
      >
        <Plus className="h-7 w-7" />
      </button>
      <NewProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

export default Projects;
