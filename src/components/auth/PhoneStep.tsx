import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface PhoneStepProps {
  onSuccess: (phone: string) => void;
}

const PHONE_REGEX = /^0[2-9]\d{7,8}$/;

function formatToE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `+972${digits.slice(1)}`;
  }
  return `+972${digits}`;
}

export function PhoneStep({ onSuccess }: PhoneStepProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isValid = PHONE_REGEX.test(phone.replace(/[\s-]/g, ""));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = phone.replace(/[\s-]/g, "");
    if (!PHONE_REGEX.test(cleaned)) {
      setError("מספר טלפון לא תקין — הזן 9-10 ספרות");
      return;
    }

    setLoading(true);
    const e164 = formatToE164(cleaned);

    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: e164,
    });

    setLoading(false);

    if (authError) {
      setError("שגיאה בשליחת הקוד. נסה שוב.");
      return;
    }

    onSuccess(e164);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          מספר טלפון
        </label>
        <Input
          ref={inputRef}
          id="phone"
          type="tel"
          dir="ltr"
          autoFocus
          placeholder="050-1234567"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          className="text-center text-lg tracking-wider h-12"
          autoComplete="tel"
          inputMode="tel"
          maxLength={12}
        />
        {error && (
          <p className="text-sm text-destructive font-medium">{error}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full text-base font-semibold"
        disabled={!isValid || loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "שלח קוד אימות"
        )}
      </Button>
    </form>
  );
}
