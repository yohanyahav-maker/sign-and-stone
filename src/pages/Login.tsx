import { useState } from "react";
import { PhoneStep } from "@/components/auth/PhoneStep";
import { OtpStep } from "@/components/auth/OtpStep";

const Login = () => {
  const [phase, setPhase] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">שינוי חתום</h1>
          <p className="text-muted-foreground text-sm">
            {phase === "phone"
              ? "הזן את מספר הטלפון שלך לכניסה"
              : "הזן את הקוד שנשלח אליך"}
          </p>
        </div>

        {phase === "phone" ? (
          <PhoneStep
            onSuccess={(phone) => {
              setPhone(phone);
              setPhase("otp");
            }}
          />
        ) : (
          <OtpStep
            phone={phone}
            onBack={() => setPhase("phone")}
          />
        )}
      </div>
    </div>
  );
};

export default Login;
