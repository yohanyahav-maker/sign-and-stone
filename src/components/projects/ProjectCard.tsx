import { useNavigate } from "react-router-dom";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const projectTypeLabels: Record<string, string> = {
  residential: "מגורים",
  commercial: "מסחרי",
  renovation: "שיפוץ",
  infrastructure: "תשתיות",
  other: "אחר",
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
      className="w-full text-right rounded-lg border bg-card p-4 space-y-3 transition-colors
                 hover:border-primary/40 active:bg-muted"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{project.name}</h3>
          {project.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{project.address}</span>
            </p>
          )}
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full shrink-0">
          {projectTypeLabels[project.project_type] ?? project.project_type}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        {pending > 0 && (
          <span className="flex items-center gap-1 text-accent font-medium">
            <Clock className="h-4 w-4" />
            {pending} ממתינים
          </span>
        )}
        {approvedSum > 0 && (
          <span className="flex items-center gap-1 text-success font-medium">
            <CheckCircle className="h-4 w-4" />
            ₪{approvedSum.toLocaleString("he-IL")}
          </span>
        )}
      </div>
    </button>
  );
}
