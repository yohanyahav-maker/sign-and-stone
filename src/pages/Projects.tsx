import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProjects, useProjectChangeOrderCounts } from "@/hooks/useProjects";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner } from "@/components/projects/SubscriptionBanner";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyProjects } from "@/components/projects/EmptyProjects";

// Demo data
const demoProjects = [
  { id: "demo-1", name: "וילה כהן", address: "רחוב האלון 12, קיסריה", project_type: "villa" as const, pending: 3, approvedSum: 82000 },
  { id: "demo-2", name: "תוספת קומה — לוי", address: "הרצליה", project_type: "addition" as const, pending: 1, approvedSum: 24000 },
];

const projectTypeLabels: Record<string, string> = {
  villa: "וילה", ground_attached: "צמוד קרקע", advanced: "בנייה מתקדמת",
  addition: "תוספת קומה", renovation: "שיפוץ מקיף",
  residential: "מגורים", commercial: "מסחרי", infrastructure: "תשתיות", other: "אחר",
};

function KpiCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex-1 rounded-[14px] bg-card p-5 text-center space-y-1">
      <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = !user;

  const { data: profile } = useProfile();
  const { data: projects, isLoading } = useProjects();
  const { data: subscription } = useSubscription();
  const projectIds = projects?.map((p) => p.id) ?? [];
  const { data: counts } = useProjectChangeOrderCounts(projectIds);

  const displayName = isDemo ? "קבלן" : (profile?.full_name || profile?.company_name || "קבלן");

  // Compute KPIs
  const totalPending = isDemo
    ? demoProjects.reduce((s, p) => s + p.pending, 0)
    : projectIds.reduce((s, id) => s + (counts?.[id]?.pending ?? 0), 0);

  const totalApproved = isDemo
    ? 12
    : projectIds.reduce((s, id) => {
        const c = counts?.[id];
        return s + (c ? (c.approvedSum > 0 ? 1 : 0) : 0); // count projects with approvals
      }, 0);

  const totalSum = isDemo
    ? 106000
    : projectIds.reduce((s, id) => s + (counts?.[id]?.approvedSum ?? 0), 0);

  const atLimit = subscription && projects ? projects.length >= subscription.project_limit : false;

  const renderProjects = () => {
    if (isDemo) {
      return demoProjects.map((p) => (
        <button
          key={p.id}
          onClick={() => navigate(`/projects/${p.id}`)}
          className="w-full text-right rounded-[14px] bg-card p-5 space-y-2 transition-colors active:bg-secondary"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base truncate">{p.name}</h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {projectTypeLabels[p.project_type]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{p.address}</p>
        </button>
      ));
    }

    if (isLoading) {
      return (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return <EmptyProjects />;
    }

    return projects.map((project) => (
      <ProjectCard key={project.id} project={project} counts={counts?.[project.id]} />
    ));
  };

  return (
    <div dir="rtl" className="px-5 py-8 space-y-8 max-w-2xl mx-auto">
      {/* Greeting */}
      <h1 className="text-2xl font-bold text-foreground">
        שלום, {displayName}
      </h1>

      {/* Subscription banner */}
      {!isDemo && <SubscriptionBanner />}

      {/* KPI Cards */}
      <div className="flex gap-3">
        <KpiCard value={String(totalPending)} label="ממתינים לאישור" />
        <KpiCard value={String(totalApproved)} label="שינויים מאושרים" />
        <KpiCard value={`₪${totalSum.toLocaleString("he-IL")}`} label="סה״כ תוספות" />
      </div>

      {/* Project List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">פרויקטים</h2>
        {renderProjects()}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          if (isDemo) navigate("/login");
          else if (!atLimit) navigate("/projects/new");
        }}
        disabled={!isDemo && atLimit}
        className="fixed bottom-24 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-primary-foreground shadow-soft transition-transform active:scale-95 disabled:opacity-40"
        aria-label="פרויקט חדש"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default Projects;
