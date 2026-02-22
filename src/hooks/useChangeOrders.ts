import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export function useChangeOrders(projectId: string) {
  return useQuery({
    queryKey: ["change_orders", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_orders")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useChangeOrder(id: string) {
  return useQuery({
    queryKey: ["change_order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_orders")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateChangeOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (co: Omit<TablesInsert<"change_orders">, "user_id">) => {
      const { data, error } = await supabase
        .from("change_orders")
        .insert({ ...co, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["change_orders", data.project_id] });
    },
  });
}

export function useUpdateChangeOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"change_orders"> & { id: string }) => {
      const { data, error } = await supabase
        .from("change_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["change_orders", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["change_order", data.id] });
    },
  });
}
