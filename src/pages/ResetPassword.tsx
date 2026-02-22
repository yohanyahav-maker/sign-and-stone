import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sets the session automatically from the recovery link hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("הסיסמה עודכנה בהצלחה");
      navigate("/projects", { replace: true });
    }
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-muted-foreground text-sm">מאמת קישור...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">איפוס סיסמה</h1>
          <p className="text-muted-foreground text-sm">הזן סיסמה חדשה</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">סיסמה חדשה</label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoFocus
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center text-lg h-12"
                autoComplete="new-password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full text-base font-semibold" disabled={!password || loading}>
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "עדכן סיסמה"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
