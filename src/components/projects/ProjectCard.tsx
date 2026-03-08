import { useNavigate } from "react-router-dom";
import { Eye, PenLine } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const projectTypeLabels: Record<string, string> = {
  villa: "וילה", ground_attached: "צמוד קרקע", advanced: "בנייה מתקדמת",
  addition: "תוספת קומה", renovation: "שיפוץ מקיף",
  residential: "מגורים", commercial: "מסחרי", infrastructure: "תשתיות", other: "אחר",
};

interface ProjectCardProps {
  project: Tables<"projects">;
  counts?: { pending: number; approvedSum: number };
  isClient?: boolean;
}

export function ProjectCard({ project, counts, isClient }: ProjectCardProps) {
  const navigate = useNavigate();
  const pending = counts?.pending ?? 0;
  const approvedSum = counts?.approvedSum ?? 0;

  // Left border color based on status
  const borderLeftColor = isClient
    ? pending > 0
      ? 'hsl(var(--warning))'
      : 'hsl(var(--muted-foreground))'
    : pending > 0
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
        <div className="min-w-0">
          <h3 className="font-bold text-base truncate">
            {project.client_name || project.name}
          </h3>
          {project.address && (
            <p className="text-sm text-muted-foreground truncate">{project.address}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isClient && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Eye className="h-3 w-3" />
              צפייה
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {projectTypeLabels[project.project_type] ?? project.project_type}
          </span>
        </div>
      </div>

      {isClient && pending > 0 && (
        <div className="flex items-center gap-2 text-xs pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 text-warning border border-warning/30 px-2.5 py-0.5 font-bold">
            <PenLine className="h-3 w-3" />
            {pending} ממתינים לחתימתך
          </span>
        </div>
      )}

      {!isClient && (pending > 0 || approvedSum > 0) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          {pending > 0 && <span className="text-primary font-semibold">{pending} ממתינים</span>}
          {approvedSum > 0 && <span className="text-success font-semibold">₪{approvedSum.toLocaleString("he-IL")} מאושר</span>}
        </div>
      )}
    </button>
  );
}
