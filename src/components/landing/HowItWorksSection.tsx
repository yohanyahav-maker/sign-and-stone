import { ClipboardEdit, Calculator, CloudUpload } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: ClipboardEdit,
    title: "מזינים שינוי",
    description: "מתארים את השינוי, מצרפים תמונות ומסמכים רלוונטיים.",
  },
  {
    num: 2,
    icon: Calculator,
    title: "תמחור ואישור דיגיטלי",
    description: "מוסיפים מחיר, שולחים ללקוח, והוא מאשר בחתימה דיגיטלית.",
  },
  {
    num: 3,
    icon: CloudUpload,
    title: "תיעוד חתום בענן",
    description: "כל שינוי נשמר עם חתימה, תאריך וזמן — ראייה משפטית מלאה.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            איך זה עובד?
          </h2>
          <p className="text-muted-foreground text-lg">
            תהליך פשוט ב-3 שלבים — מהשינוי ועד לחתימה.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line — desktop only */}
          <div className="hidden md:block absolute top-12 right-[16.67%] left-[16.67%] h-0.5 bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((step) => (
              <div key={step.num} className="relative flex flex-col items-center text-center space-y-4">
                {/* Numbered circle */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 md:static md:mt-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {step.num}
                </span>
                <h3 className="font-bold text-xl text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
