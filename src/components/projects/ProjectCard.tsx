import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

const projectTypeLabels: Record<string, string> = {
  villa: "וילה", ground_attached: "צמוד קרקע", advanced: "בנייה מתקדמת",
  addition: "תוספת קומה", renovation: "שיפוץ מקיף",
  residential: "מגורים", commercial: "מסחרי", infrastructure: "תשתיות", other: "אחר",
};

interface ProjectCardProps {
  project: Tables<"projects">;
  counts?: { pending: number; approvedSum: number };
}

export function ProjectCard({ project, counts }: ProjectCardProps) {
  const navigate = useNavigate();
  const pending = counts?.pending ?? 0;
  const approvedSum = counts?.approvedSum ?? 0;

  // Left border color based on status
  const borderLeftColor = pending > 0
    ? 'hsl(var(--gold-500))'
    : approvedSum > 0
      ? 'hsl(var(--success))'
      : 'var(--border-default)';

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full text-right rounded-2xl bg-card p-5 space-y-2 transition-all hover:bg-secondary active:scale-[0.985] relative overflow-hidden card-shimmer"
      style={{
        border: '1px solid var(--border-default)',
        borderLeftWidth: '3px',
        borderLeftColor,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-base truncate">{project.name}</h3>
        <span className="text-xs text-muted-foreground shrink-0">
          {projectTypeLabels[project.project_type] ?? project.project_type}
        </span>
      </div>

      {project.address && (
        <p className="text-sm text-muted-foreground truncate">{project.address}</p>
      )}

      {(pending > 0 || approvedSum > 0) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          {pending > 0 && <span className="text-primary font-semibold">{pending} ממתינים</span>}
          {approvedSum > 0 && <span className="text-success font-semibold">₪{approvedSum.toLocaleString("he-IL")} מאושר</span>}
        </div>
      )}
    </button>
  );
}
