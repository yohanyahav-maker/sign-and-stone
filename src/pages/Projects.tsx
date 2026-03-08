import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProjects, useProjectChangeOrderCounts } from "@/hooks/useProjects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyProjects } from "@/components/projects/EmptyProjects";
import { SocialFooter } from "@/components/layout/SocialFooter";

function KpiCard({ value, label, variant }: { value: string; label: string; variant?: "gold" | "green" }) {
  return (
    <div className="flex-1 rounded-2xl bg-card p-5 text-center space-y-1 relative overflow-hidden card-shimmer"
         style={{ border: '1px solid var(--border-default)' }}>
      <p className={`text-3xl font-black tracking-tight ${
        variant === "gold" ? "text-primary" : variant === "green" ? "text-success" : "text-foreground"
      }`}>{value}</p>
      <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: projects, isLoading } = useProjects();
  const projectIds = projects?.map((p) => p.id) ?? [];
  const { data: counts } = useProjectChangeOrderCounts(projectIds);

  const totalPending = projectIds.reduce((s, id) => s + (counts?.[id]?.pending ?? 0), 0);
  const totalApproved = projectIds.reduce((s, id) => {
    const c = counts?.[id];
    return s + (c ? (c.approvedSum > 0 ? 1 : 0) : 0);
  }, 0);
  const totalSum = projectIds.reduce((s, id) => s + (counts?.[id]?.approvedSum ?? 0), 0);

  return (
    <div dir="rtl" className="px-5 py-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground">הפרויקטים שלי</h1>
      </div>

      {/* KPI Cards */}
      <div className="flex gap-3">
        <KpiCard value={String(totalPending)} label="ממתינים לאישור" variant="gold" />
        <KpiCard value={String(totalApproved)} label="שינויים מאושרים" />
        <KpiCard value={`₪${totalSum.toLocaleString("he-IL")}`} label="סה״כ תוספות" variant="green" />
      </div>

      {/* Project List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : !projects || projects.length === 0 ? (
          <EmptyProjects />
        ) : (
          projects.map((project, i) => {
            const isClient = project.user_id !== user?.id;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.06, ease: "easeOut" }}
              >
                <ProjectCard project={project} counts={counts?.[project.id]} isClient={isClient} />
              </motion.div>
            );
          })
        )}
      </div>

      <SocialFooter />

      {/* FAB — Always visible */}
      <motion.button
        onClick={() => navigate("/projects/new")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
        className="fixed bottom-28 left-5 z-[999] flex h-[60px] w-[60px] items-center justify-center rounded-full text-2xl font-light shadow-lg transition-all duration-150 hover:scale-110 hover:shadow-xl active:scale-90 pointer-events-auto bg-primary text-primary-foreground"
        aria-label="לקוח חדש"
      >
        <Plus className="h-7 w-7" />
      </motion.button>
    </div>
  );
};

export default Projects;
