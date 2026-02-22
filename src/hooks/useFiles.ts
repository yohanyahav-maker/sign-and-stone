import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FileRecord {
  id: string;
  project_id: string;
  owner_user_id: string;
  entity_type: string;
  entity_id: string;
  bucket: string;
  path: string;
  mime_type: string | null;
  size: number | null;
  original_name: string | null;
  created_at: string;
}

interface UploadFileParams {
  projectId: string;
  entityType: string;
  entityId: string;
  file: File;
}

export function useFiles(entityType?: string, entityId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const filesQuery = useQuery({
    queryKey: ["files", entityType, entityId],
    enabled: !!entityType && !!entityId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("entity_type", entityType!)
        .eq("entity_id", entityId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FileRecord[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ projectId, entityType, entityId, file }: UploadFileParams) => {
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop() || "bin";
      const uuid = crypto.randomUUID();
      const path = `projects/${projectId}/${entityType}/${entityId}/${uuid}.${ext}`;

      setUploadProgress(0);

      const { error: storageError } = await supabase.storage
        .from("files")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) throw storageError;

      setUploadProgress(100);

      const { data, error: dbError } = await supabase
        .from("files")
        .insert({
          project_id: projectId,
          owner_user_id: user.id,
          entity_type: entityType,
          entity_id: entityId,
          bucket: "files",
          path,
          mime_type: file.type || null,
          size: file.size,
          original_name: file.name,
        })
        .select()
        .single();

      if (dbError) {
        // Rollback storage upload on DB error
        await supabase.storage.from("files").remove([path]);
        throw dbError;
      }

      return data as FileRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", entityType, entityId] });
      toast.success("הקובץ הועלה בהצלחה");
    },
    onError: (error: Error) => {
      toast.error(`שגיאה בהעלאה: ${error.message}`);
    },
    onSettled: () => {
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileRecord: FileRecord) => {
      const { error: storageError } = await supabase.storage
        .from("files")
        .remove([fileRecord.path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("files")
        .delete()
        .eq("id", fileRecord.id);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", entityType, entityId] });
      toast.success("הקובץ נמחק");
    },
    onError: (error: Error) => {
      toast.error(`שגיאה במחיקה: ${error.message}`);
    },
  });

  const getSignedUrl = async (path: string, expiresIn = 86400) => {
    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  };

  return {
    files: filesQuery.data ?? [],
    isLoading: filesQuery.isLoading,
    error: filesQuery.error,
    uploadFile: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    deleteFile: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    getSignedUrl,
  };
}
