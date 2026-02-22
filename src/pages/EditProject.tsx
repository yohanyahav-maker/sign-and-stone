import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EditProject = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div dir="rtl" className="p-6 text-center">
        <p className="text-muted-foreground">פרויקט לא נמצא</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="px-4 py-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/projects/${id}`)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">עריכת פרויקט</h1>
      </div>
      <p className="text-muted-foreground text-sm">עריכת {project.name} — בקרוב</p>
    </div>
  );
};

export default EditProject;
