import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-4xl font-black tracking-tight">שינוי חתום</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          ניהול שינויי חוזה לקבלני בנייה — פשוט, מהיר, חתום.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <StatusBadge variant="draft" />
          <StatusBadge variant="priced" />
          <StatusBadge variant="sent" />
          <StatusBadge variant="approved" />
          <StatusBadge variant="rejected" />
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button size="lg" className="w-full text-base font-semibold">
            התחל ניסיון חינם — 14 יום
          </Button>
          <Button variant="outline" size="lg" className="w-full text-base">
            התחברות
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
