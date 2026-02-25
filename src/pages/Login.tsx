import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import { SocialFooter } from "@/components/layout/SocialFooter";
import { Loader2 } from "lucide-react";

const Login = () => {
  const { session, loading } = useAuth();
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
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl text-foreground">
            שינוי <span className="text-primary">חתום</span>
          </h1>
          <p className="text-lg font-semibold text-foreground">ברוכים הבאים!</p>
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
