import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export function useMessages(projectId: string | undefined) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ["messages", projectId];

  const { data: messages, isLoading } = useQuery({
    queryKey: key,
    enabled: !!projectId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", projectId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`messages-${projectId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` },
        () => {
          qc.invalidateQueries({ queryKey: key });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      if (!projectId || !user) throw new Error("Missing context");
      const { error } = await supabase.from("messages").insert({
        project_id: projectId,
        user_id: user.id,
        content,
        type: "text",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const sendVoiceMessage = useMutation({
    mutationFn: async ({ blob, projectId: pid }: { blob: Blob; projectId: string }) => {
      if (!user) throw new Error("Not authenticated");

      const uuid = crypto.randomUUID();
      const ext = "webm";
      const path = `projects/${pid}/voice/${uuid}.${ext}`;

      // Upload to storage
      const { error: storageError } = await supabase.storage
        .from("files")
        .upload(path, blob, {
          cacheControl: "3600",
          contentType: blob.type || "audio/webm",
        });
      if (storageError) throw storageError;

      // Get signed URL
      const { data: urlData, error: urlError } = await supabase.storage
        .from("files")
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year
      if (urlError) throw urlError;

      // Insert message
      const { error: dbError } = await supabase.from("messages").insert({
        project_id: pid,
        user_id: user.id,
        content: "🎤 הודעה קולית",
        type: "voice",
        file_url: urlData.signedUrl,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  return { messages, isLoading, sendMessage, sendVoiceMessage };
}
