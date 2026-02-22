import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DetailsStep, type ChangeOrderDetails } from "@/components/changes/DetailsStep";
import { PricingStep, type ChangeOrderPricing } from "@/components/changes/PricingStep";
import { useCreateChangeOrder } from "@/hooks/useChangeOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { LocalFile } from "@/components/changes/FileUploadZone";
import { toast } from "sonner";

const NewChange = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState<ChangeOrderDetails | null>(null);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const createCO = useCreateChangeOrder();

  const handleDetailsNext = (data: ChangeOrderDetails, localFiles: LocalFile[]) => {
    setDetails(data);
    setFiles(localFiles);
    setStep(2);
  };

  const uploadFiles = async (changeOrderId: string) => {
    if (!user || files.length === 0) return;

    for (const f of files) {
      const ext = f.file.name.split(".").pop() ?? "bin";
      const storagePath = `${user.id}/${changeOrderId}/${f.id}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("attachments")
        .upload(storagePath, f.file, { upsert: false });

      if (uploadErr) {
        console.error("Upload error:", uploadErr);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("attachments")
        .getPublicUrl(storagePath);

      await supabase.from("attachments").insert({
        change_order_id: changeOrderId,
        user_id: user.id,
        file_name: f.file.name,
        file_url: urlData.publicUrl,
        file_type: f.type as any,
        file_size_bytes: f.file.size,
      });
    }
  };

  const handlePricingSubmit = async (pricing: ChangeOrderPricing, asDraft: boolean) => {
    if (!details || !projectId) return;

    try {
      const co = await createCO.mutateAsync({
        project_id: projectId,
        title: details.title,
        category: details.category as any,
        description: details.description,
        status: asDraft ? "draft" : "priced",
        price_amount: pricing.price_amount,
        include_vat: pricing.include_vat,
        vat_rate: pricing.vat_rate,
        impact_days: pricing.impact_days,
      });

      await uploadFiles(co.id);
      navigate(`/projects/${projectId}`, { replace: true });
    } catch (err) {
      toast.error("שגיאה ביצירת השינוי");
    }
  };

  return (
    <div className="px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === 2 ? setStep(1) : navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">שינוי חדש</h1>
          <p className="text-sm text-muted-foreground">
            שלב {step} מתוך 2 — {step === 1 ? "פרטים" : "תמחור"}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        <div className="h-1 flex-1 rounded-full bg-foreground" />
        <div className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-foreground" : "bg-muted"}`} />
      </div>

      {/* Steps */}
      {step === 1 ? (
        <DetailsStep
          initial={details ?? undefined}
          initialFiles={files}
          onNext={handleDetailsNext}
          onCancel={() => navigate(-1)}
        />
      ) : (
        <PricingStep
          onSubmit={handlePricingSubmit}
          onBack={() => setStep(1)}
          loading={createCO.isPending}
        />
      )}
    </div>
  );
};

export default NewChange;
