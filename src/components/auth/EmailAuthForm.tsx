import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const GOOGLE_TIMEOUT_MS = 10000;

export function EmailAuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    const timeout = setTimeout(() => {
      setGoogleLoading(false);
      setError("הזמן הקצוב לכניסה עם Google עבר. נסה שוב.");
    }, GOOGLE_TIMEOUT_MS);

    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        clearTimeout(timeout);
        setError(error.message || "שגיאה בהתחברות עם Google");
        setGoogleLoading(false);
      }
      // If no error, page will redirect — keep loading state
    } catch {
      clearTimeout(timeout);
      setError("שגיאה בהתחברות עם Google");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }
        toast.success("נרשמת בהצלחה! בדוק את האימייל לאימות.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      navigate("/projects");
    } catch {
      setError("שגיאה בהתחברות, נסה שוב");
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("הזן אימייל תחילה");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        toast.success("קישור לאיפוס סיסמה נשלח לאימייל שלך");
      }
    } catch {
      setError("שגיאה בשליחת קישור, נסה שוב");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full text-base font-medium gap-3"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        כניסה עם Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">או</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">אימייל</label>
          <Input
            id="email"
            type="email"
            dir="ltr"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="text-center text-lg h-12"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">סיסמה</label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="text-center text-lg h-12"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-0 min-w-0 p-1"
              tabIndex={-1}
              aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive font-medium text-center">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full text-base font-semibold"
          disabled={!email || !password || loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isSignUp ? "הרשמה" : "כניסה"}
        </Button>

        {!isSignUp && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            שכחת סיסמה?
          </button>
        )}

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {isSignUp ? "כבר יש לך חשבון? כניסה" : "אין לך חשבון? הרשמה"}
        </button>
      </form>
    </div>
  );
}
