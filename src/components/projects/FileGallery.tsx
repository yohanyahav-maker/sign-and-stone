import { useState, useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { Image, FileText, Film, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FileGalleryProps {
  projectId: string;
}

const isImage = (mime: string | null) => mime?.startsWith("image/");
const isVideo = (mime: string | null) => mime?.startsWith("video/");

export function FileGallery({ projectId }: FileGalleryProps) {
  const { files, isLoading } = useFiles("project", projectId);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!files.length) return;

    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      await Promise.all(
        files.map(async (f) => {
          try {
            const { data } = await supabase.storage
              .from("files")
              .createSignedUrl(f.path, 3600);
            if (data?.signedUrl) urls[f.id] = data.signedUrl;
          } catch {}
        })
      );
      setSignedUrls(urls);
    };

    fetchUrls();
  }, [files]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!files.length) return null;

  const handleDownload = (url: string, name: string | null) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "file";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">קבצים ({files.length})</h2>
      <div className="grid grid-cols-3 gap-2">
        {files.map((file) => {
          const url = signedUrls[file.id];
          const image = isImage(file.mime_type);
          const video = isVideo(file.mime_type);

          return (
            <button
              key={file.id}
              onClick={() => url && handleDownload(url, file.original_name)}
              disabled={!url}
              className="group relative aspect-square rounded-xl border bg-muted/50 overflow-hidden transition-all hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              {image && url ? (
                <img
                  src={url}
                  alt={file.original_name || "תמונה"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2">
                  {video ? (
                    <Film className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  )}
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {file.original_name || "קובץ"}
                  </span>
                </div>
              )}

              {/* Download overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Download className="h-5 w-5 text-white" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
