import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "קבלן יחיד",
    price: "149",
    period: "ש״ח / חודש",
    description: "לקבלן עצמאי שמנהל פרויקטים בעצמו",
    features: [
      "עד 3 פרויקטים פעילים",
      "שינויים ללא הגבלה",
      "חתימה דיגיטלית",
      "שליחה בוואטסאפ",
      "תמיכה בוואטסאפ",
    ],
    popular: false,
  },
  {
    name: "קבוצת קבלנים",
    price: "349",
    period: "ש״ח / חודש",
    description: "לחברות עם צוות קבלנים ומנהלי פרויקטים",
    features: [
      "פרויקטים ללא הגבלה",
      "שינויים ללא הגבלה",
      "חתימה דיגיטלית",
      "שליחה בוואטסאפ",
      "דוחות מתקדמים",
      "ניהול צוות",
      "תמיכה עדיפה",
    ],
    popular: true,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            תמחור פשוט, ללא הפתעות
          </h2>
          <p className="text-muted-foreground text-lg">
            14 יום ניסיון חינם · ללא כרטיס אשראי · ביטול בכל רגע
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-6 space-y-5 relative ${
                plan.popular
                  ? "border-primary bg-card shadow-lg"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  הכי פופולרי
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 font-semibold ${
                  plan.popular
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : ""
                }`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate("/login")}
              >
                התחל ניסיון חינם
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
