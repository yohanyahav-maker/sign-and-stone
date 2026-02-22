import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (session) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">שינוי חתום</h1>
          <p className="text-muted-foreground text-sm">
            הזן אימייל וסיסמה לכניסה
          </p>
        </div>

        <EmailAuthForm />
      </div>
    </div>
  );
};

export default Login;
