import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "האם לשינוי חתום יש תוקף משפטי?",
    a: "כן. המערכת מתעדת כל אישור עם חתימה דיגיטלית, תאריך, שעה, כתובת IP ומזהה דפדפן — מה שמהווה ראייה קבילה בהתאם לחוק חתימה אלקטרונית.",
  },
  {
    q: "איך עובדת החתימה הדיגיטלית?",
    a: "הלקוח מקבל קישור מאובטח לצפייה בשינוי. הוא יכול לאשר או לדחות, וכל פעולה מתועדת עם חותמת זמן ופרטי זיהוי.",
  },
  {
    q: "האם הנתונים שלי מאובטחים?",
    a: "בהחלט. אנחנו משתמשים בהצפנה מקצה לקצה, שרתים מאובטחים, וגיבויים אוטומטיים. כל המידע שמור בענן עם תקני אבטחה מחמירים.",
  },
  {
    q: "אפשר לנהל קבלני משנה במערכת?",
    a: "כן. תוכל ליצור פרויקטים נפרדים לכל קבלן משנה, לנהל שינויים בנפרד, ולשמור תיעוד מסודר לכל אחד.",
  },
  {
    q: "האם המערכת מתאימה לעורכי דין?",
    a: "לגמרי. עורכי דין יכולים לגשת לכל היסטוריית השינויים, לראות חתימות ואישורים, ולהשתמש בתיעוד כראייה משפטית.",
  },
  {
    q: "כמה עולה המערכת?",
    a: "אנחנו מציעים תקופת ניסיון חינם של 14 יום ללא צורך בכרטיס אשראי. לאחר מכן, תוכנית בסיסית ותוכנית מקצועית לפי הצרכים שלך.",
  },
  {
    q: "האם אפשר לייצא דוחות ומסמכים?",
    a: "כן. המערכת מאפשרת ייצוא מסמכי PDF חתומים לכל שינוי, כולל פרטי האישור, תמחור והיסטוריית שינויים.",
  },
];

const FaqSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-muted-foreground text-lg">
            כל מה שרצית לדעת על שינוי חתום.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border rounded-lg px-6 bg-card"
              >
                <AccordionTrigger className="text-base font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
