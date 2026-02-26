import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Returns a Set of change_order IDs that have been viewed by the client
 * (i.e. have a CLIENT_OPENED_PORTAL audit_log entry).
 */
export function useViewedChangeOrders(changeOrderIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["viewed_change_orders", changeOrderIds.sort().join(",")],
    enabled: !!user && changeOrderIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("record_id")
        .eq("action", "CLIENT_OPENED_PORTAL")
        .eq("table_name", "change_orders")
        .in("record_id", changeOrderIds);

      if (error) throw error;
      return new Set((data ?? []).map((d) => d.record_id));
    },
  });
}
