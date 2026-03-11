import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, MoreVertical, FileText, Camera, Image, Video, Clock, CheckCircle2, FilePlus, Phone, Mail, Calculator, Upload, MessageCircle, TrendingUp, History, Paperclip, Plus, ChevronDown, Eye } from "lucide-react";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useChangeOrders } from "@/hooks/useChangeOrders";
import { ChangeOrderCard } from "@/components/changes/ChangeOrderCard";
import { useViewedChangeOrders } from "@/hooks/useViewedChangeOrders";
import { useAuth } from "@/hooks/useAuth";
import { FileGallery } from "@/components/projects/FileGallery";
import { useFiles } from "@/hooks/useFiles";
import { CalculatorDialog } from "@/components/projects/CalculatorDialog";
import { ChatDrawer } from "@/components/projects/ChatDrawer";
import { format } from "date-fns";
import { he } from "date-fns/locale";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const isValidUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

type ChangeFilter = "all" | "pending" | "approved" | "rejected" | "draft";

const changeFilterLabels: Record<ChangeFilter, string> = {
  all: "הכל",
  pending: "ממתין",
  approved: "חתום",
  rejected: "נדחה",
  draft: "טיוטה",
};

const ProjectDetail = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const validProjectId = projectId && isValidUuid(projectId) ? projectId : undefined;
  const { uploadFile, isUploading } = useFiles("project", validProjectId);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [calcOpen, setCalcOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [changeFilter, setChangeFilter] = useState<ChangeFilter>("all");
  const [showAttachments, setShowAttachments] = useState(false);

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

  const isClient = !!project && project.user_id !== user?.id;

  const { data: changeOrders, isLoading: coLoading } = useChangeOrders(validProjectId ?? "");
  const allCoIds = (changeOrders ?? []).map((co) => co.id);
  const { data: viewedSet } = useViewedChangeOrders(allCoIds);

  if (projLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!project) {
    return <div className="p-6 text-center"><p className="text-muted-foreground">לקוח לא נמצא</p></div>;
  }

  const clientPhone = project.client_phone?.replace(/[^0-9+]/g, "") || "";
  const whatsappUrl = clientPhone ? `https://wa.me/972${clientPhone.replace(/^0/, "")}` : "";

  const pendingOrders = changeOrders?.filter(co => co.status === "sent") ?? [];
  const approvedOrders = changeOrders?.filter(co => co.status === "approved") ?? [];
  const rejectedOrders = changeOrders?.filter(co => co.status === "rejected") ?? [];
  const draftOrders = changeOrders?.filter(co => co.status === "draft" || co.status === "priced") ?? [];

  const approvedTotal = approvedOrders.reduce((sum, co) => {
    const base = Number(co.price_amount) || 0;
    return sum + (co.include_vat ? base * (1 + Number(co.vat_rate) / 100) : base);
  }, 0);

  const pendingTotal = pendingOrders.reduce((sum, co) => {
    const base = Number(co.price_amount) || 0;
    return sum + (co.include_vat ? base * (1 + Number(co.vat_rate) / 100) : base);
  }, 0);

  const totalCount = changeOrders?.length ?? 0;

  const filteredChanges = (() => {
    if (!changeOrders) return [];
    switch (changeFilter) {
      case "pending": return pendingOrders;
      case "approved": return approvedOrders;
      case "rejected": return rejectedOrders;
      case "draft": return draftOrders;
      default: return changeOrders;
    }
  })();

  return (
    <div dir="rtl" className="px-4 py-5 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/projects")}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary transition-colors border border-border">
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{project.client_name || project.name}</h1>
          {project.address && (
            <p className="text-xs text-muted-foreground truncate">{project.address}</p>
          )}
        </div>
        {!isClient && (
          <div className="flex items-center gap-1.5">
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#25D366] hover:bg-[#25D366]/15 transition-colors">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            )}
            {clientPhone && (
              <a href={`tel:${clientPhone}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-info hover:bg-info/15 transition-colors">
                <Phone className="h-4 w-4" />
              </a>
            )}
            {project.client_email && (
              <a href={`mailto:${project.client_email}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-primary/15 transition-colors">
                <Mail className="h-4 w-4" />
              </a>
            )}
            <button onClick={() => navigate(`/projects/${projectId}/edit`)}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="אפשרויות">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}
        {isClient && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground border border-border">
            <Eye className="h-3.5 w-3.5" />
            צפייה בלבד
          </span>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="rounded-xl bg-card border border-border p-3.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15">
              <FileText className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">סה״כ</span>
          </div>
          <p className="text-lg font-bold">{totalCount}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl bg-card border border-border p-3.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-success/15">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">חתום</span>
          </div>
          <p className="text-lg font-bold text-success">₪{approvedTotal.toLocaleString("he-IL", { maximumFractionDigits: 0 })}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl bg-card border border-border p-3.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-warning/15">
              <Clock className="h-3.5 w-3.5 text-warning" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">ממתין</span>
          </div>
          <p className="text-lg font-bold text-warning">₪{pendingTotal.toLocaleString("he-IL", { maximumFractionDigits: 0 })}</p>
        </motion.div>
      </div>

      {/* Pending signature banner for clients */}
      {isClient && pendingOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-warning/10 border border-warning/30 p-4 space-y-1"
        >
          <p className="text-sm font-bold text-warning flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {pendingOrders.length} שינויים ממתינים לחתימתך
          </p>
          <p className="text-xs text-muted-foreground">לחץ על שינוי כדי לצפות בפרטים</p>
        </motion.div>
      )}

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {!isClient && (
          <button onClick={() => navigate(`/projects/${projectId}/changes/new`)}
            className="shrink-0 flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            שינוי חדש
          </button>
        )}
        <button onClick={() => setShowAttachments(!showAttachments)}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors border ${
            showAttachments ? "bg-accent/15 text-accent border-accent/30" : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
          }`}>
          <Paperclip className="h-3.5 w-3.5" />
          קבצים
        </button>
        {!isClient && (
          <>
            <button onClick={() => setChatOpen(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-secondary text-muted-foreground px-3.5 py-2 text-sm font-medium border border-border hover:bg-secondary/80 transition-colors">
              <MessageCircle className="h-3.5 w-3.5" />
              צ׳אט
            </button>
            <button onClick={() => setCalcOpen(true)}
              className="shrink-0 flex items-center gap-1.5 rounded-full bg-secondary text-muted-foreground px-3.5 py-2 text-sm font-medium border border-border hover:bg-secondary/80 transition-colors">
              <Calculator className="h-3.5 w-3.5" />
              מחשבון
            </button>
            <button onClick={() => cameraRef.current?.click()}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => docRef.current?.click()}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 transition-colors">
              <Upload className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => videoRef.current?.click()}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 transition-colors">
              <Video className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Attachments Section (collapsible) */}
      {showAttachments && validProjectId && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              קבצים מצורפים
            </h2>
          </div>
          <FileGallery projectId={validProjectId} />
        </motion.div>
      )}

      {/* Changes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">שינויים</h2>
          <span className="text-xs text-muted-foreground">{filteredChanges.length} שינויים</span>
        </div>

        {/* Change Filters */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {(Object.keys(changeFilterLabels) as ChangeFilter[]).filter(key => !isClient || key !== "draft").map((key) => {
            const count = key === "all" ? totalCount
              : key === "pending" ? pendingOrders.length
              : key === "approved" ? approvedOrders.length
              : key === "rejected" ? rejectedOrders.length
              : draftOrders.length;

            return (
              <button
                key={key}
                onClick={() => setChangeFilter(key)}
                className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  changeFilter === key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {changeFilterLabels[key]}
                {count > 0 && (
                  <span className={`text-[10px] ${changeFilter === key ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Change Orders List */}
        {coLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredChanges.length > 0 ? (
          <div className="space-y-2.5">
            {filteredChanges.map((co, i) => (
              <motion.div
                key={co.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
              >
                <ChangeOrderCard changeOrder={co} viewed={viewedSet?.has(co.id)} isClient={isClient} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <History className="h-7 w-7 text-muted-foreground" />
            </div>
            {changeFilter === "all" ? (
              <>
                <p className="text-base font-semibold text-foreground mb-1.5">
                  עדיין לא תועד אף שינוי בפרויקט
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                  תיעוד שינויים מאפשר לך לעקוב אחרי כל החלטה, חומר ועדכון בפרויקט
                </p>
                {!isClient && (
                  <button
                    onClick={() => navigate(`/projects/${projectId}/changes/new`)}
                    className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    + תעד שינוי ראשון
                  </button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {`אין שינויים ${changeFilterLabels[changeFilter]}`}
              </p>
            )}
          </div>
        )}
      </div>

      <CalculatorDialog open={calcOpen} onOpenChange={setCalcOpen} />
      {validProjectId && (
        <ChatDrawer
          open={chatOpen}
          onOpenChange={setChatOpen}
          projectId={validProjectId}
          clientName={project.client_name || project.name}
        />
      )}

      {/* Hidden file inputs */}
      <input ref={docRef} type="file" multiple accept=".pdf,application/pdf" onChange={handleFileUpload} className="hidden" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
      <input ref={videoRef} type="file" accept="video/*" capture="environment" onChange={handleFileUpload} className="hidden" />
    </div>
  );
};

export default ProjectDetail;
