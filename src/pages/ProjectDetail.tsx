import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Loader2, FolderOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChangeOrders } from "@/hooks/useChangeOrders";
import { ChangeOrderCard } from "@/components/changes/ChangeOrderCard";

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: changeOrders, isLoading: coLoading } = useChangeOrders(projectId!);

  if (projLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">פרויקט לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/projects")}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{project.name}</h1>
          {project.address && (
            <p className="text-sm text-muted-foreground truncate">{project.address}</p>
          )}
        </div>
      </div>

      {/* Change Orders */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold">שינויים</h2>

        {coLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : changeOrders && changeOrders.length > 0 ? (
          changeOrders.map((co) => <ChangeOrderCard key={co.id} changeOrder={co} />)
        ) : (
          <div className="flex flex-col items-center py-12 text-center space-y-3">
            <div className="rounded-full bg-muted p-3">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">אין שינויים עדיין — צור את הראשון</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate(`/projects/${projectId}/changes/new`)}
        className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center
                   rounded-full bg-primary text-primary-foreground shadow-lg
                   transition-transform active:scale-95"
        aria-label="שינוי חדש"
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
};

export default ProjectDetail;
