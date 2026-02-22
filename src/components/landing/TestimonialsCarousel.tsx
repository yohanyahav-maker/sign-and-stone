import { Star } from "lucide-react";

const testimonials = [
  {
    name: "דרור כהן",
    role: "קבלן ביצוע, קיסריה",
    text: "מאז שאני משתמש בשינוי חתום, אין לי יותר ויכוחים עם לקוחות. הכל מתועד, חתום ומאובטח. שקט נפשי מלא.",
    initials: "דכ",
  },
  {
    name: "אבי לוי",
    role: "קבלן שיפוצים, תל אביב",
    text: "הייתי מפסיד אלפי שקלים על שינויים לא מתועדים. היום כל שינוי חתום ומאושר — אני מוגן לגמרי.",
    initials: "אל",
  },
  {
    name: "מיכאל ברק",
    role: "יזם נדל״ן, הרצליה",
    text: "כיזם שמנהל פרויקטים רבים, המערכת נותנת לי שקיפות מלאה. אני יודע בדיוק מה מאושר, מה ממתין ומה השורה התחתונה.",
    initials: "מב",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            מה אומרים הלקוחות שלנו
          </h2>
          <p className="text-muted-foreground text-lg">
            אנשי מקצוע מובילים בענף הבנייה סומכים על שינוי חתום.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-sm text-foreground leading-relaxed">
                "{t.text}"
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
