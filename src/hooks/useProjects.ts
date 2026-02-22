import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { TablesInsert } from "@/integrations/supabase/types";

export function useProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useProjectChangeOrderCounts(projectIds: string[]) {
  return useQuery({
    queryKey: ["change_order_counts", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_orders")
        .select("project_id, status, price_amount")
        .in("project_id", projectIds);
      if (error) throw error;

      const counts: Record<string, { pending: number; approvedSum: number }> = {};
      for (const co of data) {
        if (!counts[co.project_id]) {
          counts[co.project_id] = { pending: 0, approvedSum: 0 };
        }
        if (co.status === "sent") {
          counts[co.project_id].pending += 1;
        }
        if (co.status === "approved" && co.price_amount) {
          counts[co.project_id].approvedSum += Number(co.price_amount);
        }
      }
      return counts;
    },
  });
}

export function useCreateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: Omit<TablesInsert<"projects">, "user_id">) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...project, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
