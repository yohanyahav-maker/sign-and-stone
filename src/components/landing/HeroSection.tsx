import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, FileCheck } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>הגנה משפטית לקבלנים</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground">
            כל שינוי בפרויקט –{" "}
            <span className="text-primary">מתועד, מאושר ומוגן משפטית.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            מערכת ניהול שינויי חוזה שמונעת סכסוכים, מתעדת כל שינוי עם חתימה
            דיגיטלית, ומגנה על הקבלן מרגע ההסכמה ועד סיום הפרויקט.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="text-base font-semibold px-8 h-14"
              onClick={() => navigate("/login")}
            >
              <FileCheck className="h-5 w-5" />
              התחל ניסיון חינם — 14 יום
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 h-14"
              onClick={() => navigate("/login")}
            >
              בקש הדגמה
            </Button>
          </div>

          {/* Trust line */}
          <p className="text-sm text-muted-foreground pt-2">
            ✓ ללא כרטיס אשראי &nbsp; ✓ התקנה תוך דקות &nbsp; ✓ תמיכה בעברית
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
