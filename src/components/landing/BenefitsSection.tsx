import { HardHat, Scale, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const audiences = [
  {
    icon: HardHat,
    title: "לקבלן הראשי",
    benefits: [
      "שליטה מלאה בכל שינוי בפרויקט",
      "מעקב אחר סטטוס אישורים בזמן אמת",
      "הגנה משפטית עם תיעוד חתום",
      "ניהול קבלני משנה בצורה מסודרת",
    ],
  },
  {
    icon: Scale,
    title: "לעורך הדין",
    benefits: [
      "תיעוד משפטי מלא עם חתימות דיגיטליות",
      "ראיות ברורות לכל שינוי ואישור",
      "מניעת סכסוכים לפני שהם מתחילים",
      "גישה מהירה להיסטוריית שינויים",
    ],
  },
  {
    icon: Users,
    title: "לקבלן המשנה",
    benefits: [
      "שקיפות מלאה מול הקבלן הראשי",
      "אישורים ברורים עם תמחור מוסכם",
      "הגנה מפני דרישות לא מתועדות",
      "תיעוד עצמאי של כל עבודה נוספת",
    ],
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            יתרונות לכל קהל
          </h2>
          <p className="text-muted-foreground text-lg">
            בין אם אתה קבלן ראשי, קבלן משנה או עורך דין — שינוי חתום עובד
            בשבילך.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {audiences.map((audience) => (
            <Card
              key={audience.title}
              className="border border-border bg-card hover:border-primary/40 transition-colors"
            >
              <CardContent className="p-8 space-y-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <audience.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-foreground">
                  {audience.title}
                </h3>
                <ul className="space-y-3">
                  {audience.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
