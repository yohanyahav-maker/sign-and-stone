import { ClipboardEdit, MessageCircle, FileCheck } from "lucide-react";

const steps = [
  {
    num: 1,
    icon: ClipboardEdit,
    title: "יוצרים שינוי",
    description: "מתארים את השינוי, מוסיפים מחיר ותמונות — תוך דקה.",
  },
  {
    num: 2,
    icon: MessageCircle,
    title: "שולחים בוואטסאפ",
    description: "הלקוח מקבל לינק, רואה את הפרטים ומאשר ישירות מהנייד.",
  },
  {
    num: 3,
    icon: FileCheck,
    title: "הלקוח חותם",
    description: "חתימה דיגיטלית מחייבת — המסמך נשמר בענן עם תוקף משפטי.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            איך זה עובד?
          </h2>
          <p className="text-muted-foreground text-lg">
            תהליך פשוט ב-3 שלבים — מהשינוי ועד לחתימה.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div key={step.num} className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                <step.icon className="h-9 w-9 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                  {step.num}
                </span>
              </div>
              <h3 className="font-bold text-xl text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
