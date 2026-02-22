import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Tables } from "@/integrations/supabase/types";

const categoryLabels: Record<string, string> = {
  structural: "שלד ובטון",
  concrete: "יציקות ותבניות",
  electrical: "חשמל",
  plumbing: "אינסטלציה",
  aluminum: "אלומיניום וחלונות",
  kitchen: "מטבח",
  finishing: "גמרים",
  flooring: "ריצוף וחיפוי",
  painting: "צביעה וטיח",
  insulation: "איטום ובידוד",
  hvac: "מיזוג אוויר",
  landscaping: "פיתוח חוץ",
  safety: "בטיחות",
  other: "אחר",
};

interface ChangeOrderCardProps {
  changeOrder: Tables<"change_orders">;
}

export function ChangeOrderCard({ changeOrder }: ChangeOrderCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${changeOrder.project_id}/changes/${changeOrder.id}`)}
      className="w-full text-right rounded-lg border bg-card p-4 space-y-2 transition-all duration-200
                 hover:border-foreground/20 active:bg-muted"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm truncate flex-1">{changeOrder.title}</h3>
        <StatusBadge variant={changeOrder.status as any} />
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="bg-muted px-2 py-0.5 rounded text-xs">
          {categoryLabels[changeOrder.category] ?? changeOrder.category}
        </span>
        {changeOrder.price_amount != null && changeOrder.price_amount > 0 && (
          <span className="font-semibold text-foreground">
            ₪{Number(changeOrder.price_amount).toLocaleString("he-IL")}
          </span>
        )}
        {(changeOrder.impact_days ?? 0) !== 0 && (
          <span className="text-accent font-medium">
            {changeOrder.impact_days! > 0 ? "+" : ""}{changeOrder.impact_days} ימים
          </span>
        )}
      </div>
    </button>
  );
}
