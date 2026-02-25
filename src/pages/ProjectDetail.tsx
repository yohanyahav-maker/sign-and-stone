import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, MoreVertical, FileText, Camera, Image, Video, Clock, CheckCircle2, FilePlus, Phone, Mail, Calculator, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChangeOrders } from "@/hooks/useChangeOrders";
import { ChangeOrderCard } from "@/components/changes/ChangeOrderCard";
import { useAuth } from "@/hooks/useAuth";
import { FileGallery } from "@/components/projects/FileGallery";
import { useFiles } from "@/hooks/useFiles";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const isValidUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

type ViewMode = "grid" | "pending" | "approved" | "gallery";

const ProjectDetail = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const validProjectId = projectId && isValidUuid(projectId) ? projectId : undefined;
  const { uploadFile, isUploading } = useFiles("project", validProjectId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !validProjectId) return;
    for (const file of Array.from(files)) {
      await uploadFile({ projectId: validProjectId, entityType: "project", entityId: validProjectId, file });
    }
    e.target.value = "";
  };

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ["project", validProjectId],
    enabled: !!validProjectId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", validProjectId!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: changeOrders, isLoading: coLoading } = useChangeOrders(validProjectId ?? "");

  if (projLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!project) {
    return <div className="p-6 text-center"><p className="text-muted-foreground">פרויקט לא נמצא</p></div>;
  }

  const clientPhone = project.client_phone?.replace(/[^0-9+]/g, "") || "";
  const whatsappUrl = clientPhone ? `https://wa.me/972${clientPhone.replace(/^0/, "")}` : "";

  const pendingOrders = changeOrders?.filter(co => co.status === "sent") ?? [];
  const approvedOrders = changeOrders?.filter(co => co.status === "approved") ?? [];

  const gridButtons = [
    // Row 1: right=שינוי חדש, left=גלריה
    { icon: FilePlus, label: "שינוי חדש", color: "text-primary", onClick: () => navigate(`/projects/${projectId}/changes/new`) },
    { icon: Image, label: "גלריה", color: "text-accent", onClick: () => setViewMode("gallery") },
    // Row 2: right=ממתין לאישור, left=העלאת מסמך
    { icon: Clock, label: "ממתין לאישור", color: "text-warning", onClick: () => setViewMode("pending"), badge: pendingOrders.length || undefined },
    { icon: FileText, label: "העלאת מסמך", color: "text-info", onClick: () => docRef.current?.click() },
    // Row 3: right=שינויים מאושרים, left=צלם/העלה תמונה
    { icon: CheckCircle2, label: "שינויים מאושרים", color: "text-success", onClick: () => setViewMode("approved"), badge: approvedOrders.length || undefined },
    { icon: Camera, label: "צלם/העלה תמונה", color: "text-success", onClick: () => cameraRef.current?.click() },
    // Row 4: right=מחשבון, left=צלם/העלה וידאו
    { icon: Calculator, label: "מחשבון", color: "text-info", onClick: () => {} },
    { icon: Video, label: "צלם/העלה וידאו", color: "text-info", onClick: () => videoRef.current?.click() },
  ];

  return (
    <div dir="rtl" className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => viewMode === "grid" ? navigate("/projects") : setViewMode("grid")}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors" style={{ border: '1px solid var(--border-default)' }}>
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">פרוייקט</h1>
          <p className="text-sm text-muted-foreground truncate">{project.client_name || project.name}</p>
        </div>
        <button onClick={() => navigate(`/projects/${projectId}/edit`)}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          style={{ border: '1px solid var(--border-default)' }} aria-label="אפשרויות">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Quick contact icons */}
      <div className="flex items-center justify-center gap-4">
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 transition-colors">
            <WhatsAppIcon className="h-6 w-6" />
          </a>
        )}
        {clientPhone && (
          <a href={`tel:${clientPhone}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-info/15 text-info hover:bg-info/25 transition-colors">
            <Phone className="h-6 w-6" />
          </a>
        )}
        {project.client_email && (
          <a href={`mailto:${project.client_email}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary hover:bg-primary/25 transition-colors">
            <Mail className="h-6 w-6" />
          </a>
        )}
      </div>

      {/* Content based on view mode */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-2 gap-3">
          {gridButtons.map((btn, i) => (
            <motion.button
              key={btn.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
              whileTap={{ scale: 0.95 }}
              onClick={btn.onClick}
              className="relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-card p-5 min-h-[100px] transition-colors hover:bg-secondary"
              style={{ border: '1px solid var(--border-default)' }}>
              <btn.icon className={`h-7 w-7 ${btn.color}`} />
              <span className="text-sm font-medium text-foreground text-center leading-tight">{btn.label}</span>
              {btn.badge && btn.badge > 0 && (
                <span className="absolute top-2 left-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1">
                  {btn.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {viewMode === "pending" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">ממתינים לאישור</h2>
          {coLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : pendingOrders.length > 0 ? (
            pendingOrders.map(co => <ChangeOrderCard key={co.id} changeOrder={co} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">אין שינויים ממתינים לאישור</p>
          )}
        </div>
      )}

      {viewMode === "approved" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">שינויים מאושרים</h2>
          {coLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : approvedOrders.length > 0 ? (
            approvedOrders.map(co => <ChangeOrderCard key={co.id} changeOrder={co} />)
          ) : (
            <p className="text-center text-muted-foreground py-8">אין שינויים מאושרים</p>
          )}
        </div>
      )}

      {viewMode === "gallery" && validProjectId && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">גלריה</h2>
          <FileGallery projectId={validProjectId} />
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" multiple accept="image/*,video/*,.pdf" onChange={handleFileUpload} className="hidden" />
      <input ref={docRef} type="file" multiple accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
      <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={handleFileUpload} className="hidden" />
    </div>
  );
};

export default ProjectDetail;
