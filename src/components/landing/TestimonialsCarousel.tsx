import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "דרור כהן",
    role: "קבלן ביצוע וילות, קיסריה",
    text: "מאז שאני משתמש בשינוי חתום, אין לי יותר ויכוחים עם בעלי בתים. כל שינוי מתועד עם תמונות, מחיר וחתימה. שקט נפשי מלא.",
    initials: "דכ",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "אבי לוי",
    role: "קבלן בנייה פרטית, מרכז",
    text: "הייתי מפסיד עשרות אלפי שקלים על שינויים לא מתועדים בוילות. היום כל שינוי חתום ומאושר — אני מוגן לגמרי.",
    initials: "אל",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "מיכאל ברק",
    role: "קבלן תוספות קומה, שרון",
    text: "בתוספת קומה יש המון שינויים. המערכת נותנת לי שקיפות מלאה — יודע בדיוק כמה שינויים מאושרים ומה השורה התחתונה.",
    initials: "מב",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "רונית שמעוני",
    role: "אדריכלית ומפקחת בנייה, תל אביב",
    text: "כמפקחת, אני צריכה לעקוב אחרי כל שינוי באתר. המערכת חוסכת לי שעות של עבודה ומונעת טעויות יקרות.",
    initials: "רש",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "יוסי אברהם",
    role: "קבלן שיפוצים, חיפה",
    text: "לקוחות מתלהבים מהמקצועיות. הם מקבלים הכל מסודר — תיאור, מחיר, תמונות. זה שידרג לי את העסק.",
    initials: "יא",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "נועה גולן",
    role: "מנהלת פרויקטים, הרצליה",
    text: "ניהול שינויים היה הכאב הכי גדול שלי. עכשיו הכל דיגיטלי, חתום ושקוף. ממליצה בחום לכל מי שעובד בבנייה.",
    initials: "נג",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "עמית דוד",
    role: "קבלן גמר, ראשון לציון",
    text: "בעבודות גמר, השינויים הם חלק בלתי נפרד. המערכת מאפשרת לי לתעד הכל תוך שניות, ישר מהשטח.",
    initials: "עד",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "שרה מזרחי",
    role: "מעצבת פנים, רעננה",
    text: "לקוחות משנים את דעתם כל הזמן. עם שינוי חתום אני שולחת הצעה מסודרת ומקבלת אישור דיגיטלי תוך דקות.",
    initials: "שמ",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "אלון פרץ",
    role: "קבלן שלד ובנייה, באר שבע",
    text: "לפני שהכרתי את המערכת, הפסדתי כסף על שינויים שלא תועדו. היום אני רגוע — הכל שחור על לבן.",
    initials: "אפ",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "דנה רוזנברג",
    role: "קבלנית איטום ובידוד, נתניה",
    text: "המערכת פשוטה ונוחה. גם אני וגם הלקוחות שלי אוהבים את השקיפות. זה נותן תחושת ביטחון לשני הצדדים.",
    initials: "דר",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            קבלני בנייה סומכים על שינוי חתום
          </h2>
          <p className="text-muted-foreground text-lg">
            אנשי מקצוע מובילים בענף הבנייה הפרטית כבר עובדים איתנו.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              direction: "rtl",
            }}
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((t) => (
                <CarouselItem
                  key={t.name}
                  className="pl-4 basis-full md:basis-1/3"
                >
                  <div className="rounded-2xl bg-card p-6 space-y-4 h-full relative overflow-hidden card-shimmer" style={{ border: '1px solid var(--border-default)' }}>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-[15px] text-foreground/80 leading-relaxed min-h-[4.5rem]">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={t.image} alt={t.name} />
                        <AvatarFallback className="bg-secondary text-foreground text-sm font-bold">
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
