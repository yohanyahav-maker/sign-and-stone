import { useState, useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { FileText, Film, Download, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

interface FileGalleryProps {
  projectId: string;
}

const isImage = (mime: string | null) => mime?.startsWith("image/");
const isVideo = (mime: string | null) => mime?.startsWith("video/");
const isPdf = (mime: string | null) => mime === "application/pdf";
const isPreviewable = (mime: string | null) => isImage(mime) || isVideo(mime) || isPdf(mime);

export function FileGallery({ projectId }: FileGalleryProps) {
  const { files, isLoading } = useFiles("project", projectId);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

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

  // Keyboard navigation for preview
  useEffect(() => {
    if (previewIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewIndex(null);
      if (e.key === "ArrowRight") setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowLeft") setPreviewIndex((i) => (i !== null && i < files.length - 1 ? i + 1 : i));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewIndex, files.length]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!files.length) {
    return <p className="text-sm text-muted-foreground">אין קבצים עדיין</p>;
  }

  const handleClick = (index: number) => {
    const file = files[index];
    const url = signedUrls[file.id];
    if (!url) return;

    if (isPreviewable(file.mime_type)) {
      setPreviewIndex(index);
    } else {
      // Non-previewable: download
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_name || "file";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    }
  };

  const handleDownload = (url: string, name: string | null) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "file";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  const previewFile = previewIndex !== null ? files[previewIndex] : null;
  const previewUrl = previewFile ? signedUrls[previewFile.id] : null;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {files.map((file, index) => {
          const url = signedUrls[file.id];
          const image = isImage(file.mime_type);
          const video = isVideo(file.mime_type);

          return (
            <button
              key={file.id}
              onClick={() => handleClick(index)}
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

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Download className="h-5 w-5 text-white" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Fullscreen preview overlay */}
      <AnimatePresence>
        {previewIndex !== null && previewFile && previewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col"
            onClick={() => setPreviewIndex(null)}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setPreviewIndex(null)} className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="h-5 w-5 text-white" />
              </button>
              <span className="text-white text-sm truncate max-w-[200px]">{previewFile.original_name || "קובץ"}</span>
              <button
                onClick={() => handleDownload(previewUrl, previewFile.original_name)}
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Download className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {isImage(previewFile.mime_type) && (
                <img
                  src={previewUrl}
                  alt={previewFile.original_name || "תמונה"}
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              )}
              {isVideo(previewFile.mime_type) && (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  className="max-h-full max-w-full rounded-lg"
                />
              )}
              {isPdf(previewFile.mime_type) && (
                <iframe
                  src={previewUrl}
                  className="w-full h-full rounded-lg bg-white"
                  title={previewFile.original_name || "PDF"}
                />
              )}
            </div>

            {/* Navigation arrows */}
            {files.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex((i) => (i !== null && i < files.length - 1 ? i + 1 : i)); }}
                  disabled={previewIndex >= files.length - 1}
                  className="pointer-events-auto h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i)); }}
                  disabled={previewIndex <= 0}
                  className="pointer-events-auto h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            )}

            {/* Counter */}
            <div className="text-center text-white/60 text-xs py-2 shrink-0">
              {previewIndex + 1} / {files.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
