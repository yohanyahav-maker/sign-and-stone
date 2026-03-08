import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCheck } from "lucide-react";
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
  viewed?: boolean;
}

export function ChangeOrderCard({ changeOrder, viewed }: ChangeOrderCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/projects/${changeOrder.project_id}/changes/${changeOrder.id}`)}
      className="w-full text-right rounded-xl bg-card border border-border shadow-sm p-4 space-y-2 transition-all duration-200
                 hover:bg-secondary active:scale-[0.985]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm truncate flex-1">{changeOrder.title}</h3>
        <div className="flex items-center gap-1.5">
          {viewed && changeOrder.status !== "approved" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
              <CheckCheck className="h-3 w-3" />
              נצפה
            </span>
          )}
          {changeOrder.status === "approved" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold bg-success/15 text-success border border-success/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              שינוי חתום
            </span>
          ) : (
            <StatusBadge variant={changeOrder.status as any} />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="px-2 py-0.5 rounded text-xs bg-muted border border-border">
          {categoryLabels[changeOrder.category] ?? changeOrder.category}
        </span>
        {changeOrder.price_amount != null && changeOrder.price_amount > 0 && (
          <span className={`font-bold ${changeOrder.status === 'approved' ? 'text-success' : 'text-foreground'}`}>
            ₪{Number(changeOrder.price_amount).toLocaleString("he-IL")}
          </span>
        )}
        {(changeOrder.impact_days ?? 0) !== 0 && (
          <span className={`font-semibold ${changeOrder.impact_days! > 0 ? 'text-warning' : 'text-destructive'}`}>
            {changeOrder.impact_days! > 0 ? "+" : ""}{changeOrder.impact_days} ימים
          </span>
        )}
      </div>
    </button>
  );
}
