import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().min(1, "שם מלא הוא שדה חובה"),
  company_name: z.string().min(1, "שם חברה הוא שדה חובה"),
  phone: z.string().optional(),
  logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        company_name: values.company_name,
        phone: values.phone || null,
        logo_url: values.logo_url || null,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    navigate("/projects", { replace: true });
  };

  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">ברוך הבא</h1>
          <p className="text-muted-foreground text-sm">מלא את הפרטים כדי להתחיל</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <Label htmlFor="full_name">שם מלא <span className="text-destructive">*</span></Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-destructive text-xs">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="company_name">שם חברה <span className="text-destructive">*</span></Label>
            <Input id="company_name" {...register("company_name")} />
            {errors.company_name && (
              <p className="text-destructive text-xs">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phone">טלפון</Label>
            <Input id="phone" type="tel" {...register("phone")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="logo_url">קישור ללוגו</Label>
            <Input id="logo_url" type="url" {...register("logo_url")} />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "המשך"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
