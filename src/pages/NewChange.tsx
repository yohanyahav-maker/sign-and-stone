import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DetailsStep, type ChangeOrderDetails } from "@/components/changes/DetailsStep";
import { PricingStep, type ChangeOrderPricing } from "@/components/changes/PricingStep";
import { ReviewStep } from "@/components/changes/ReviewStep";
import { useCreateChangeOrder, useUpdateChangeOrder } from "@/hooks/useChangeOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { LocalFile } from "@/components/changes/FileUploadZone";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { parseChangeOrderError } from "@/lib/supabase-errors";

const stepLabels = ["פרטים", "תמחור", "סיכום ושליחה"];

const NewChange = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [details, setDetails] = useState<ChangeOrderDetails | null>(null);
  const [pricing, setPricing] = useState<ChangeOrderPricing | null>(null);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const createCO = useCreateChangeOrder();
  const updateCO = useUpdateChangeOrder();
  

  const editId = (location.state as any)?.editId as string | undefined;
  const isEdit = !!editId;

  // Fetch existing change order for edit mode
  const { data: existingCO } = useQuery({
    queryKey: ["change_order", editId],
    enabled: !!editId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("change_orders")
        .select("*")
        .eq("id", editId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Pre-populate state from existing change order
  useEffect(() => {
    if (!existingCO) return;
    if (details === null) {
      setDetails({
        title: existingCO.title,
        category: existingCO.category,
        description: existingCO.description ?? "",
      });
    }
    if (pricing === null) {
      setPricing({
        price_amount: Number(existingCO.price_amount ?? 0),
        include_vat: existingCO.include_vat,
        vat_rate: Number(existingCO.vat_rate),
        impact_days: existingCO.impact_days ?? 0,
      });
    }
  }, [existingCO]);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("client_portal_enabled, client_phone, client_name")
        .eq("id", projectId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleDetailsNext = (data: ChangeOrderDetails, localFiles: LocalFile[]) => {
    setDetails(data);
    setFiles(localFiles);
    setStep(2);
  };

  const handlePricingNext = (data: ChangeOrderPricing) => {
    setPricing(data);
    setStep(3);
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

      await supabase.from("attachments").insert({
        change_order_id: changeOrderId,
        user_id: user.id,
        file_name: f.file.name,
        file_url: storagePath,
        file_type: f.type as any,
        file_size_bytes: f.file.size,
        context: f.context ?? null,
      });
    }
  };

  const handleSave = async (status: "draft" | "priced" | "sent") => {
    if (!details || !projectId || isMutating) return;

    const pricingData = pricing ?? {
      price_amount: 0,
      include_vat: true,
      vat_rate: 17,
      impact_days: 0,
    };

    try {
      let coId: string;

      if (isEdit) {
        const updated = await updateCO.mutateAsync({
          id: editId!,
          title: details.title,
          category: details.category as any,
          description: details.description,
          status,
          price_amount: pricingData.price_amount,
          include_vat: pricingData.include_vat,
          vat_rate: pricingData.vat_rate,
          impact_days: pricingData.impact_days,
        });
        coId = updated.id;
      } else {
        const created = await createCO.mutateAsync({
          project_id: projectId,
          title: details.title,
          category: details.category as any,
          description: details.description,
          status,
          price_amount: pricingData.price_amount,
          include_vat: pricingData.include_vat,
          vat_rate: pricingData.vat_rate,
          impact_days: pricingData.impact_days,
        });
        coId = created.id;
      }

      await uploadFiles(coId);

      if (status === "sent" || status === "priced") {
        if (status === "priced") {
          toast.success("השינוי נשמר בהצלחה");
          navigate(`/projects/${projectId}`, { replace: true });
        } else {
          navigate(`/projects/${projectId}/changes/${coId}/send`, { replace: true });
        }
      } else {
        toast.success("הטיוטה נשמרה");
        navigate(`/projects/${projectId}`, { replace: true });
      }
    } catch (err: any) {
      toast.error(parseChangeOrderError(err));
    }
  };

  const handleSlideToSend = async () => {
    if (!details || !projectId || !pricing || isSaving) return;
    setIsSaving(true);

    try {
      let coId: string;

      if (isEdit) {
        const updated = await updateCO.mutateAsync({
          id: editId!,
          title: details.title,
          category: details.category as any,
          description: details.description,
          status: "priced",
          price_amount: pricing.price_amount,
          include_vat: pricing.include_vat,
          vat_rate: pricing.vat_rate,
          impact_days: pricing.impact_days,
        });
        coId = updated.id;
      } else {
        const created = await createCO.mutateAsync({
          project_id: projectId,
          title: details.title,
          category: details.category as any,
          description: details.description,
          status: "priced",
          price_amount: pricing.price_amount,
          include_vat: pricing.include_vat,
          vat_rate: pricing.vat_rate,
          impact_days: pricing.impact_days,
        });
        coId = created.id;
      }

      await uploadFiles(coId);
      navigate(`/projects/${projectId}/changes/${coId}/send`, { replace: true });
    } catch (err: any) {
      toast.error(parseChangeOrderError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
    else navigate(-1);
  };

  const isMutating = createCO.isPending || updateCO.isPending;

  return (
    <div dir="rtl" className="px-5 py-8 space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-secondary transition-colors"
          style={{ border: '1px solid var(--border-default)' }}
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">{isEdit ? "עריכת שינוי" : "שינוי חדש"}</h1>
          <p className="text-sm text-muted-foreground">
            {stepLabels[step - 1]}
          </p>
        </div>
      </div>

      {/* Progress — gold dots */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              s <= step ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Steps */}
      {step === 1 && (
        <DetailsStep
          initial={details ?? undefined}
          initialFiles={files}
          onNext={handleDetailsNext}
          onCancel={() => navigate(-1)}
        />
      )}

      {step === 2 && (
        <PricingStep
          initial={pricing ?? undefined}
          onNext={handlePricingNext}
          onSaveDraft={() => handleSave("draft")}
          onBack={() => setStep(1)}
          loading={isMutating}
        />
      )}

      {step === 3 && details && pricing && (
        <ReviewStep
          details={details}
          pricing={pricing}
          filesCount={files.length}
          onSend={handleSlideToSend}
          onSaveDraft={() => handleSave(pricing.price_amount > 0 ? "priced" : "draft")}
          onBack={() => setStep(2)}
          loading={isMutating}
          clientEnabled={project?.client_portal_enabled ?? false}
        />
      )}
    </div>
  );
};

export default NewChange;
