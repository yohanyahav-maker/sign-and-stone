import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useProjects, useProjectChangeOrderCounts } from "@/hooks/useProjects";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionBanner } from "@/components/projects/SubscriptionBanner";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyProjects } from "@/components/projects/EmptyProjects";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";

const Projects = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: profile } = useProfile();
  const { data: projects, isLoading } = useProjects();
  const { data: subscription } = useSubscription();

  const projectIds = projects?.map((p) => p.id) ?? [];
  const { data: counts } = useProjectChangeOrderCounts(projectIds);

  const totalPending = projects
    ? projectIds.reduce((sum, id) => sum + (counts?.[id]?.pending ?? 0), 0)
    : 0;

  const atLimit =
    subscription && projects
      ? projects.length >= subscription.project_limit
      : false;

  const displayName = profile?.full_name || profile?.company_name || "קבלן";

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">שלום, {displayName} 👋</h1>
        {totalPending > 0 && (
          <p className="text-sm text-muted-foreground">
            יש לך <span className="text-primary font-semibold">{totalPending}</span> שינויים ממתינים לאישור
          </p>
        )}
      </div>

      {/* Subscription Banner */}
      <SubscriptionBanner />

      {/* Projects */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">הפרויקטים שלי</h2>
            <span className="text-sm text-muted-foreground">
              {projects.length}/{subscription?.project_limit ?? "∞"}
            </span>
          </div>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              counts={counts?.[project.id]}
            />
          ))}
        </div>
      ) : (
        <EmptyProjects />
      )}

      {/* FAB */}
      <button
        onClick={() => {
          if (atLimit) return;
          setSheetOpen(true);
        }}
        disabled={atLimit}
        className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center
                   rounded-full bg-primary text-primary-foreground shadow-lg
                   transition-transform active:scale-95
                   disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="פרויקט חדש"
      >
        <Plus className="h-7 w-7" />
      </button>

      {atLimit && (
        <p className="text-center text-sm text-destructive">
          הגעת למגבלת הפרויקטים בתוכנית שלך — שדרג כדי להוסיף עוד
        </p>
      )}

      {/* New Project Sheet */}
      <NewProjectSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
};

export default Projects;
