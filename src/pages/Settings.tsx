import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Loader2, User, Building2, Crown, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SocialFooter } from "@/components/layout/SocialFooter";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/useTheme";

const planLabels: Record<string, string> = { basic: "בסיסי", pro: "מקצועי" };

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: subscription } = useSubscription();
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [companyName, setCompanyName] = useState(profile?.company_name ?? "");
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState(false);

  const isPro = subscription?.plan === "pro";

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setCompanyName(profile.company_name ?? "");
      // business_name from profile - need to fetch separately since types might not have it yet
      setBusinessName((profile as any).business_name ?? "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          company_name: companyName.trim() || null,
          business_name: businessName.trim() || null,
        } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("הפרופיל עודכן בהצלחה");
    } catch {
      toast.error("שגיאה בעדכון הפרופיל");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div dir="rtl" className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User className="h-6 w-6 text-muted-foreground" />
        פרופיל
      </h1>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">שם מלא</Label>
            <Input id="settings-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="השם שלך" maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-company">שם חברה</Label>
            <Input id="settings-company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="שם החברה" maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="settings-business">שם העסק</Label>
            <Input id="settings-business" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="שם העסק" maxLength={100} />
          </div>

          <div className="space-y-1.5">
            <Label>אימייל</Label>
            <Input value={user?.email ?? ""} disabled className="opacity-50" />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "שמור שינויים"}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Toggle */}
      <Card>
        <CardContent className="p-5">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              <div className="text-right">
                <p className="font-semibold text-sm">מצב תצוגה</p>
                <p className="text-xs text-muted-foreground">{theme === "dark" ? "כהה" : "בהיר"}</p>
              </div>
            </div>
            <div className={`relative w-12 h-7 rounded-full transition-colors ${theme === "light" ? "bg-primary" : "bg-muted"}`}>
              <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${theme === "light" ? "right-0.5" : "left-0.5"}`} />
            </div>
          </button>
        </CardContent>
      </Card>
      {subscription && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              מנוי
              {isPro && <Crown className="h-4 w-4 text-primary fill-primary" />}
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">תוכנית</span>
              <span className="font-semibold">{planLabels[subscription.plan] ?? subscription.plan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">סטטוס</span>
              <StatusBadge variant={subscription.status as any} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">מגבלת פרויקטים</span>
              <span className="font-semibold">{subscription.project_limit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">מגבלת שינויים חודשית</span>
              <span className="font-semibold">{subscription.monthly_change_limit}</span>
            </div>
            {subscription.status === "trial" && subscription.trial_ends_at && (
              <p className="text-sm text-primary font-medium">
                ניסיון מסתיים ב-{new Date(subscription.trial_ends_at).toLocaleDateString("he-IL")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Logout */}
      <Button variant="outline" className="w-full gap-2"
        style={{ background: 'var(--danger-bg)', color: 'hsl(var(--destructive))', borderColor: 'var(--danger-border)' }}
        onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        התנתקות
      </Button>

      <SocialFooter />
    </div>
  );
};

export default Settings;
