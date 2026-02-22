import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { DetailsStep, type ChangeOrderDetails } from "@/components/changes/DetailsStep";
import { PricingStep, type ChangeOrderPricing } from "@/components/changes/PricingStep";
import { useCreateChangeOrder } from "@/hooks/useChangeOrders";

const NewChange = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [details, setDetails] = useState<ChangeOrderDetails | null>(null);
  const createCO = useCreateChangeOrder();

  const handleDetailsNext = (data: ChangeOrderDetails) => {
    setDetails(data);
    setStep(2);
  };

  const handlePricingSubmit = async (pricing: ChangeOrderPricing, asDraft: boolean) => {
    if (!details || !projectId) return;

    await createCO.mutateAsync({
      project_id: projectId,
      title: details.title,
      category: details.category,
      description: details.description,
      status: asDraft ? "draft" : "priced",
      price_amount: pricing.price_amount,
      include_vat: pricing.include_vat,
      vat_rate: pricing.vat_rate,
      impact_days: pricing.impact_days,
    });

    navigate(`/projects/${projectId}`, { replace: true });
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
        <div className="h-1 flex-1 rounded-full bg-primary" />
        <div className={`h-1 flex-1 rounded-full ${step === 2 ? "bg-primary" : "bg-muted"}`} />
      </div>

      {/* Steps */}
      {step === 1 ? (
        <DetailsStep
          initial={details ?? undefined}
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
