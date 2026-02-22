import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function EmailAuthForm() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate("/projects");
  };

  return (
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

      <button
        type="button"
        onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isSignUp ? "כבר יש לך חשבון? כניסה" : "אין לך חשבון? הרשמה"}
      </button>
    </form>
  );
}
