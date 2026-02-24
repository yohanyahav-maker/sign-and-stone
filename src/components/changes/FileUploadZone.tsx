import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Film, ImageIcon, Camera, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LocalFile {
  id: string;
  file: File;
  preview: string;
  type: "image" | "video" | "pdf" | "other";
}

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "video/mp4", "video/quicktime", "video/webm",
  "application/pdf",
];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 10;

function getFileType(file: File): LocalFile["type"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "other";
}

interface FileUploadZoneProps {
  files: LocalFile[];
  onChange: (files: LocalFile[]) => void;
  disabled?: boolean;
}

export function FileUploadZone({ files, onChange, disabled }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles: LocalFile[] = [];
      const arr = Array.from(incoming);

      for (const file of arr) {
        if (files.length + newFiles.length >= MAX_FILES) break;
        
        // More permissive type check: accept if MIME matches or if it's from camera (type may be empty)
        const isAccepted = ACCEPTED_TYPES.includes(file.type) || 
          file.type.startsWith("image/") || 
          file.type.startsWith("video/") ||
          file.type === "";
        if (!isAccepted) continue;
        if (file.size > MAX_FILE_SIZE) continue;

        const preview = file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "";

        newFiles.push({
          id: crypto.randomUUID(),
          file,
          preview,
          type: getFileType(file),
        });
      }

      if (newFiles.length > 0) {
        onChange([...files, ...newFiles]);
      }
    },
    [files, onChange],
  );

  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      onChange(files.filter((f) => f.id !== id));
    },
    [files, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled) addFiles(e.dataTransfer.files);
    },
    [addFiles, disabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const FileIcon = ({ type }: { type: LocalFile["type"] }) => {
    if (type === "video") return <Film className="h-5 w-5 text-muted-foreground" />;
    if (type === "pdf") return <FileText className="h-5 w-5 text-muted-foreground" />;
    return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        disabled={disabled || files.length >= MAX_FILES}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-foreground/30 bg-secondary"
            : "border-border hover:border-foreground/20 hover:bg-secondary/50",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Upload className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          גרור או לחץ להעלאה
        </p>
        <p className="text-xs text-muted-foreground/60">
          תמונות, וידאו, PDF · עד 20MB
        </p>
      </button>

      {/* Camera buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled || files.length >= MAX_FILES}
          onClick={() => cameraRef.current?.click()}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-card px-3 py-3 text-sm font-medium transition-colors active:bg-secondary",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Camera className="h-5 w-5 text-muted-foreground" />
          <span>צלם</span>
        </button>
        <button
          type="button"
          disabled={disabled || files.length >= MAX_FILES}
          onClick={() => videoRef.current?.click()}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-[14px] bg-card px-3 py-3 text-sm font-medium transition-colors active:bg-secondary",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <Video className="h-5 w-5 text-muted-foreground" />
          <span>סרטון</span>
        </button>
      </div>

      <input ref={inputRef} type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleInputChange} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleInputChange} className="hidden" />
      <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={handleInputChange} className="hidden" />

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((f) => (
            <div key={f.id} className="group relative aspect-square overflow-hidden rounded-[10px] bg-secondary">
              {f.type === "image" && f.preview ? (
                <img src={f.preview} alt={f.file.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-1 p-2">
                  <FileIcon type={f.type} />
                  <p className="max-w-full truncate text-[10px] text-muted-foreground">{f.file.name}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-destructive opacity-100 sm:opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 active:opacity-100"
                aria-label="הסר קובץ"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
