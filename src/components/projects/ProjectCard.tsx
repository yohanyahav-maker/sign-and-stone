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

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full text-right rounded-[14px] bg-card p-5 space-y-2 transition-colors active:bg-secondary"
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
          {pending > 0 && <span>{pending} ממתינים</span>}
          {approvedSum > 0 && <span>₪{approvedSum.toLocaleString("he-IL")} מאושר</span>}
        </div>
      )}
    </button>
  );
}
