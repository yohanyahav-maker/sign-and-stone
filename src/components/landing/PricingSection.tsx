import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "קבלן יחיד",
    price: "149",
    period: "ש״ח / חודש",
    description: "לקבלן בנייה שמנהל פרויקטים בעצמו",
    features: [
      "עד 3 פרויקטים פעילים",
      "שינויי בנייה ללא הגבלה",
      "חתימה דיגיטלית מחייבת",
      "שליחה בוואטסאפ",
      "העלאת תמונות ומסמכים",
      "תמיכה בוואטסאפ",
    ],
    popular: false,
  },
  {
    name: "קבלן מקצועי",
    price: "349",
    period: "ש״ח / חודש",
    description: "לקבלנים עם מספר פרויקטים במקביל",
    features: [
      "פרויקטים ללא הגבלה",
      "שינויי בנייה ללא הגבלה",
      "חתימה דיגיטלית מחייבת",
      "שליחה בוואטסאפ",
      "דוחות פרויקט מתקדמים",
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
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            תמחור פשוט, ללא הפתעות
          </h2>
          <p className="text-muted-foreground text-lg">
            14 יום ניסיון חינם · ללא כרטיס אשראי · ביטול בכל רגע
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 space-y-6 relative overflow-hidden card-shimmer ${
                plan.popular
                  ? "card-gold"
                  : ""
              }`}
              style={{
                border: plan.popular ? '1px solid var(--border-gold)' : '1px solid var(--border-default)',
                background: plan.popular
                  ? 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, rgba(168,112,32,0.04) 100%)'
                  : 'hsl(240 17% 8%)',
              }}
            >
              {plan.popular && (
                <span className="absolute -top-0 left-1/2 -translate-x-1/2 translate-y-0 text-xs font-extrabold px-4 py-1 rounded-b-lg"
                      style={{ background: 'var(--gold-gradient)', color: '#1A1200' }}>
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
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-12 font-bold ${plan.popular ? 'shadow-gold-sm' : ''}`}
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
