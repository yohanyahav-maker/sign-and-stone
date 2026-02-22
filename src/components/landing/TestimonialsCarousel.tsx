import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronRight, ChevronLeft, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "אבי כהן",
    role: "קבלן וילות",
    city: "קיסריה",
    text: "מאז שאני משתמש בשינוי חתום, אין לי יותר ויכוחים עם לקוחות על שינויים. הכל מתועד, הכל חתום — שקט נפשי מלא.",
  },
  {
    name: "עו\"ד רונית לוי",
    role: "עורכת דין נדל\"ן",
    city: "תל אביב",
    text: "אני ממליצה לכל הקבלנים שלי להשתמש במערכת. היא חוסכת לי שעות של עבודה משפטית ומונעת סכסוכים מיותרים.",
  },
  {
    name: "מוחמד חלבי",
    role: "קבלן אלומיניום",
    city: "נצרת",
    text: "כקבלן משנה, תמיד הייתי חשוף למחלוקות. עכשיו כל שינוי מתועד עם מחיר ואישור — אני מוגן.",
  },
  {
    name: "יוסי ברקוביץ'",
    role: "קבלן ביצוע",
    city: "רעננה",
    text: "המערכת פשוטה לשימוש ומקצועית ברמה גבוהה. הלקוחות שלי מרגישים ביטחון כשהם רואים את התהליך המסודר.",
  },
  {
    name: "דנה אברהם",
    role: "מנהלת פרויקטים",
    city: "הרצליה",
    text: "ניהול שינויים בפרויקט גדול היה סיוט. שינוי חתום הפך את זה לתהליך פשוט וברור שכולם מבינים.",
  },
  {
    name: "עו\"ד אלי מזרחי",
    role: "עורך דין בנייה",
    city: "ירושלים",
    text: "כעורך דין שמטפל בסכסוכי בנייה, אני יכול להגיד — 80% מהתיקים שלי היו נמנעים עם מערכת כזאת.",
  },
  {
    name: "סימון דהן",
    role: "קבלן מטבחים",
    city: "באר שבע",
    text: "לקוחות מבקשים שינויים כל הזמן. עכשיו אני שולח להם אישור דיגיטלי ומקבל חתימה תוך דקות.",
  },
  {
    name: "רועי שפירא",
    role: "קבלן בנייה קלה",
    city: "נתניה",
    text: "המערכת שינתה לי את העסק. הכל מתנהל בצורה מקצועית — הלקוחות מרוצים ואני מוגן משפטית.",
  },
  {
    name: "נאדר סעיד",
    role: "קבלן שיפוצים",
    city: "חיפה",
    text: "הייתי מפסיד אלפי שקלים על שינויים לא מתועדים. היום כל שקל מתועד ומאושר מראש.",
  },
  {
    name: "מיכל גולדשטיין",
    role: "יזמית נדל\"ן",
    city: "רמת גן",
    text: "כיזמית שמנהלת פרויקטים רבים, המערכת נותנת לי שקיפות מלאה על כל שינוי בכל פרויקט.",
  },
];

const TestimonialsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      direction: "rtl",
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            מה אומרים הלקוחות שלנו
          </h2>
          <p className="text-muted-foreground text-lg">
            אנשי מקצוע מובילים בענף הבנייה סומכים על שינוי חתום.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
                >
                  <Card className="h-full border border-border bg-card">
                    <CardContent className="p-6 space-y-4">
                      <Quote className="h-8 w-8 text-primary/30" />
                      <p className="text-sm text-foreground leading-relaxed">
                        {t.text}
                      </p>
                      <div className="pt-2 border-t border-border">
                        <p className="font-bold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.role} • {t.city}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={scrollPrev}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={scrollNext}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
