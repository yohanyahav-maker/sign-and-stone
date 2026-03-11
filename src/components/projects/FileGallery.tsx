import { useState, useEffect, useMemo, useRef } from "react";
import { useFiles } from "@/hooks/useFiles";
import { FileText, Film, Download, Loader2, X, ChevronLeft, ChevronRight, ImageIcon, FileIcon, RulerIcon, VideoIcon, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

interface FileGalleryProps {
  projectId: string;
}

type FilterType = "all" | "images" | "documents" | "plans" | "videos";

const isImage = (mime: string | null) => mime?.startsWith("image/");
const isVideo = (mime: string | null) => mime?.startsWith("video/");
const isPdf = (mime: string | null) => mime === "application/pdf";
const isPreviewable = (mime: string | null) => isImage(mime) || isVideo(mime) || isPdf(mime);

const isPlan = (file: { mime_type: string | null; original_name: string | null }) => {
  const name = (file.original_name || "").toLowerCase();
  return name.includes("plan") || name.includes("תוכנית") || name.includes("תכנית") || name.includes("dwg") || name.includes("blueprint");
};

const isDocument = (file: { mime_type: string | null; original_name: string | null }) => {
  const mime = file.mime_type || "";
  return isPdf(mime) || mime.includes("word") || mime.includes("document") || mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("text/");
};

function getFileTypeInfo(file: { mime_type: string | null; original_name: string | null }) {
  if (isPlan(file)) return { icon: RulerIcon, label: "תוכנית", emoji: "📐", color: "text-accent" };
  if (isVideo(file.mime_type)) return { icon: VideoIcon, label: "וידאו", emoji: "🎥", color: "text-info" };
  if (isImage(file.mime_type)) return { icon: ImageIcon, label: "תמונה", emoji: "📷", color: "text-success" };
  if (isDocument(file)) return { icon: FileIcon, label: "מסמך", emoji: "📄", color: "text-warning" };
  return { icon: FileText, label: "קובץ", emoji: "📄", color: "text-muted-foreground" };
}

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "הכל" },
  { key: "images", label: "📷 תמונות" },
  { key: "documents", label: "📄 מסמכים" },
  { key: "plans", label: "📐 תוכניות" },
  { key: "videos", label: "🎥 וידאו" },
];

export function FileGallery({ projectId }: FileGalleryProps) {
  const { files, isLoading, uploadFile, isUploading } = useFiles("project", projectId);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleEmptyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length) return;
    for (const file of Array.from(selected)) {
      await uploadFile({ projectId, entityType: "project", entityId: projectId, file });
    }
    e.target.value = "";
  };

  useEffect(() => {
    if (!files.length) return;
    const fetchUrls = async () => {
      const urls: Record<string, string> = {};
      await Promise.all(
        files.map(async (f) => {
          try {
            const { data } = await supabase.storage.from("files").createSignedUrl(f.path, 3600);
            if (data?.signedUrl) urls[f.id] = data.signedUrl;
          } catch {}
        })
      );
      setSignedUrls(urls);
    };
    fetchUrls();
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (activeFilter === "all") return files;
    return files.filter((f) => {
      if (activeFilter === "images") return isImage(f.mime_type);
      if (activeFilter === "videos") return isVideo(f.mime_type);
      if (activeFilter === "documents") return isDocument(f) && !isPlan(f);
      if (activeFilter === "plans") return isPlan(f);
      return true;
    });
  }, [files, activeFilter]);

  // Keyboard navigation for preview
  useEffect(() => {
    if (previewIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewIndex(null);
      if (e.key === "ArrowRight") setPreviewIndex((i) => (i !== null && i > 0 ? i - 1 : i));
      if (e.key === "ArrowLeft") setPreviewIndex((i) => (i !== null && i < filteredFiles.length - 1 ? i + 1 : i));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [previewIndex, filteredFiles.length]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!files.length) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-12 px-6 text-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border">
          <UploadCloud className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">עדיין אין קבצים בפרויקט</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            העלה תמונות, מסמכים או קבצי PDF הקשורים לעבודה
          </p>
        </div>
        <button
          onClick={() => uploadRef.current?.click()}
          disabled={isUploading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          העלה קובץ ראשון
        </button>
        <input
          ref={uploadRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleEmptyUpload}
        />
      </div>
    );
  }

  const handleClick = (index: number) => {
    const file = filteredFiles[index];
    const url = signedUrls[file.id];
    if (!url) return;

    if (isPreviewable(file.mime_type)) {
      setPreviewIndex(index);
    } else {
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

  const previewFile = previewIndex !== null ? filteredFiles[previewIndex] : null;
  const previewUrl = previewFile ? signedUrls[previewFile.id] : null;

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredFiles.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">אין קבצים בקטגוריה זו</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filteredFiles.map((file, index) => {
            const url = signedUrls[file.id];
            const image = isImage(file.mime_type);
            const typeInfo = getFileTypeInfo(file);

            return (
              <button
                key={file.id}
                onClick={() => handleClick(index)}
                disabled={!url}
                className="group relative aspect-square rounded-xl border border-border bg-muted/50 overflow-hidden transition-all hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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
                    <typeInfo.icon className={`h-8 w-8 ${typeInfo.color}`} />
                    <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                      {file.original_name || "קובץ"}
                    </span>
                  </div>
                )}

                {/* Type badge */}
                <span className="absolute top-1 right-1 text-xs leading-none bg-background/80 rounded px-1 py-0.5">
                  {typeInfo.emoji}
                </span>

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-5 w-5 text-white" />
                </div>
              </button>
            );
          })}
        </div>
      )}

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
                <img src={previewUrl} alt={previewFile.original_name || "תמונה"} className="max-h-full max-w-full object-contain rounded-lg" />
              )}
              {isVideo(previewFile.mime_type) && (
                <video src={previewUrl} controls autoPlay className="max-h-full max-w-full rounded-lg" />
              )}
              {isPdf(previewFile.mime_type) && (
                <iframe src={previewUrl} className="w-full h-full rounded-lg bg-white" title={previewFile.original_name || "PDF"} />
              )}
            </div>

            {/* Navigation arrows */}
            {filteredFiles.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewIndex((i) => (i !== null && i < filteredFiles.length - 1 ? i + 1 : i)); }}
                  disabled={previewIndex >= filteredFiles.length - 1}
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
              {previewIndex + 1} / {filteredFiles.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
