import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OtpStepProps {
  phone: string;
  onBack: () => void;
}

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 3;

export function OtpStep({ phone, onBack }: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const verifyingRef = useRef(false);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (verifyingRef.current) return;
      verifyingRef.current = true;
      setError("");
      setLoading(true);

      const { error: authError } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });

      setLoading(false);
      verifyingRef.current = false;

      if (authError) {
        setAttempts((a) => a + 1);
        if (attempts + 1 >= MAX_ATTEMPTS) {
          setError("יותר מדי ניסיונות. חזור ונסה שוב.");
        } else {
          setError("קוד שגוי. נסה שוב.");
        }
        setDigits(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      navigate("/projects", { replace: true });
    },
    [phone, attempts, navigate]
  );

  const updateDigit = (index: number, value: string) => {
    // Handle paste
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (pasted.length > 0) {
        const newDigits = Array(OTP_LENGTH).fill("");
        pasted.split("").forEach((d, i) => {
          if (i < OTP_LENGTH) newDigits[i] = d;
        });
        setDigits(newDigits);
        setError("");

        const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
        inputRefs.current[nextEmpty]?.focus();

        if (pasted.length === OTP_LENGTH) {
          verifyOtp(pasted);
        }
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    const code = newDigits.join("");
    if (code.length === OTP_LENGTH && newDigits.every((d) => d !== "")) {
      verifyOtp(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setResendTimer(RESEND_SECONDS);
    setAttempts(0);

    const { error: authError } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (authError) {
      setError("שגיאה בשליחת הקוד. נסה שוב.");
    }
  };

  const blocked = attempts >= MAX_ATTEMPTS;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">קוד אימות</label>
        <div className="flex gap-2 justify-center" dir="ltr">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? "one-time-code" : "off"}
              maxLength={OTP_LENGTH}
              value={digit}
              disabled={loading || blocked}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData("text");
                if (pasted.length > 1) {
                  e.preventDefault();
                  updateDigit(i, pasted);
                }
              }}
              className="w-11 h-13 text-center text-xl font-bold rounded-md border border-input bg-background
                         focus:outline-none focus:ring-2 focus:ring-ring
                         disabled:opacity-50 transition-colors"
            />
          ))}
        </div>
        {error && (
          <p className="text-sm text-destructive font-medium text-center">{error}</p>
        )}
      </div>

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={resendTimer > 0 || blocked}
          onClick={handleResend}
          className="text-sm"
        >
          {resendTimer > 0
            ? `שלח שוב (${resendTimer}s)`
            : "שלח קוד חדש"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="text-sm"
        >
          חזור — שנה מספר טלפון
        </Button>
      </div>
    </div>
  );
}
