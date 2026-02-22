import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const mockChanges = [
  { title: "שינוי שלד קומה ב׳", price: "₪45,000", status: "approved" as const, statusLabel: "אושר" },
  { title: "תוספת קומה", price: "₪400,000", status: "pending" as const, statusLabel: "ממתין" },
  { title: "ריצוף פורצלן סלון", price: "₪9,200", status: "approved" as const, statusLabel: "אושר" },
];

const stats = [
  { value: "₪82K", label: "מאושר" },
  { value: "3", label: "ממתינים" },
  { value: "12", label: "חתומים" },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Right side — text */}
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-foreground">
              כל שינוי בבנייה —{" "}
              <span className="text-accent">חתום ומתועד</span> תוך דקות
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              בונה וילה? תוספת קומה? כל שינוי מתומחר, מצולם, נשלח ללקוח ונחתם דיגיטלית — בלי אקסלים, בלי ויכוחים, בלי הפתעות.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="text-base font-semibold px-8 h-14"
                onClick={() => navigate("/login")}
              >
                התחל ניסיון חינם 14 יום
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              ✓ ללא כרטיס אשראי &nbsp; ✓ התקנה תוך דקות
            </p>
          </div>

          {/* Left side — phone mockup */}
          <div className="flex justify-center">
            <div className="w-72 md:w-80">
              <div className="rounded-[22px] border border-border bg-card shadow-soft overflow-hidden">
                <div className="h-8 bg-secondary flex items-center justify-center">
                  <div className="w-20 h-1.5 rounded-full bg-foreground/10" />
                </div>

                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-muted-foreground">וילה כהן — קיסריה</p>
                  <p className="text-sm font-bold">שינויי בנייה</p>
                </div>

                <div className="px-3 py-2 space-y-2">
                  {mockChanges.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-[14px] border border-border p-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.price}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        c.status === "approved" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                      }`}>
                        {c.statusLabel}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-3 border-t border-border bg-secondary/50">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {stats.map((s, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold">{s.value}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-6 flex items-center justify-center">
                  <div className="w-24 h-1 rounded-full bg-foreground/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
