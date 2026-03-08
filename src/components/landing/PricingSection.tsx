import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "בסיסי",
    price: "149",
    period: "ש״ח / חודש",
    description: "לבעל מקצוע שמנהל לקוחות בעצמו",
    features: [
      "עד 3 לקוחות פעילים",
      "שינויים ללא הגבלה",
      "חתימה דיגיטלית מחייבת",
      "שליחה בוואטסאפ",
      "העלאת תמונות ומסמכים",
      "תמיכה בוואטסאפ",
    ],
    popular: false,
  },
  {
    name: "מקצועי",
    price: "349",
    period: "ש״ח / חודש",
    description: "לבעלי מקצוע עם מספר לקוחות במקביל",
    features: [
      "לקוחות ללא הגבלה",
      "שינויים ללא הגבלה",
      "חתימה דיגיטלית מחייבת",
      "שליחה בוואטסאפ",
      "דוחות מתקדמים",
      "הפקת PDF חתום",
      "תמיכה עדיפה",
    ],
    popular: true,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            מחיר פשוט. בלי הפתעות.
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            נסה את המערכת 14 יום בחינם.
            <br />
            לא צריך כרטיס אשראי כדי להתחיל.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 space-y-6 relative border shadow-sm ${
                plan.popular
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-0 text-xs font-extrabold px-4 py-1 rounded-b-lg bg-primary text-primary-foreground">
                  הכי פופולרי
                </span>
              )}

              <div className="pt-4">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-display text-[52px] text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 font-bold ${plan.popular ? 'shadow-lg' : ''}`}
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
