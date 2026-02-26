import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { SocialFooter } from "@/components/layout/SocialFooter";
import { Loader2 } from "lucide-react";
import logoLight from "@/assets/logo-clean.png";
import logoDark from "@/assets/logo-dark.png";

const Login = () => {
  const { session, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate("/projects", { replace: true });
    }
  }, [session, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <img
            src={theme === "dark" ? logoDark : logoLight}
            alt="שינוי חתום"
            className="h-14 w-auto object-contain mx-auto"
          />
          <p className="text-muted-foreground text-sm">
            התחבר כדי להמשיך
          </p>
        </div>

        <EmailAuthForm />

        <SocialFooter />
      </div>
    </div>
  );
};

export default Login;
