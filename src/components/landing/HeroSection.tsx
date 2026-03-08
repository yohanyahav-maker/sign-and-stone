import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const mockChanges = [
  { title: "שינוי פריט מטבח", price: "₪12,500", status: "approved" as const, statusLabel: "חתום ✔" },
  { title: "תוספת נקודת חשמל", price: "₪1,800", status: "pending" as const, statusLabel: "ממתין" },
  { title: "שדרוג חומרי גמר", price: "₪9,200", status: "approved" as const, statusLabel: "חתום ✔" },
];

const stats = [
  { value: "₪82K", label: "סה״כ מאושר" },
  { value: "3", label: "ממתינים" },
  { value: "12", label: "שינויים חתומים" },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-background py-24 md:py-32 overflow-hidden hero-grid blue-glow">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Right side — text */}
          <div className="space-y-8">
            <span className="inline-block text-[11px] font-bold tracking-[2px] uppercase text-primary px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10">
              ניהול שינויים מקצועי לכל בעל מקצוע
            </span>

            <h1 className="font-display text-[42px] md:text-[52px] leading-[1.08] text-foreground">
              כל שינוי בעבודה –{" "}
              <span className="text-primary">מאושר וחתום</span> מול הלקוח
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              צלם את השינוי, הוסף מחיר ושלח ללקוח לאישור.
              <br />
              הלקוח חותם באצבע והכל נשמר מסודר במערכת.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="text-base font-extrabold px-8 h-14 shadow-lg hover:shadow-xl transition-all"
                onClick={() => navigate("/login")}
              >
                צור שינוי ראשון בחינם
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base font-semibold px-8 h-14"
                onClick={() => window.location.href = "mailto:info@shinui-hatum.co.il?subject=בקשת הדגמה"}
              >
                בקש הדגמה
              </Button>
            </div>

            <p className="text-[13px] text-muted-foreground font-semibold">
              <span className="text-success">✓</span> ללא כרטיס אשראי · ניסיון חינם ל-14 יום
            </p>
          </div>

          {/* Left side — phone mockup */}
          <div className="flex justify-center">
            <div className="w-72 md:w-80">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                <div className="h-8 bg-secondary flex items-center justify-center">
                  <div className="w-20 h-1.5 rounded-full bg-foreground/10" />
                </div>

                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs text-muted-foreground">דוד כהן — שיפוץ דירה</p>
                  <p className="text-sm font-bold">שינויים</p>
                </div>

                <div className="px-3 py-2 space-y-2">
                  {mockChanges.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl p-3 border border-border bg-secondary">
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.price}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        c.status === "approved"
                          ? "text-success bg-success/10"
                          : "text-warning bg-warning/10"
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
