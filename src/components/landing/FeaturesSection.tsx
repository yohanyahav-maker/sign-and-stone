import { MessageSquare, ShieldCheck, BarChart3, Camera, FolderOpen, FileText } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "שליחת שינוי ללקוח בוואטסאפ",
    description: "הלקוח מקבל לינק, רואה את השינוי עם תמונות ומחיר, ומאשר — בלי להוריד אפליקציה.",
  },
  {
    icon: ShieldCheck,
    title: "חתימה דיגיטלית באצבע",
    description: "הלקוח חותם עם האצבע על המסך. כל חתימה נשמרת עם חותמת זמן ופרטי החותם.",
  },
  {
    icon: Camera,
    title: "תיעוד מלא של כל שינוי",
    description: "תיאור, קטגוריה, מחיר ותמונות — הכל מתועד במקום אחד ומוכן להצגה.",
  },
  {
    icon: FolderOpen,
    title: "שמירת תמונות וקבצים",
    description: "כל הקבצים של הפרויקט שמורים במערכת — תמונות, מסמכים ותוכניות.",
  },
  {
    icon: BarChart3,
    title: "מעקב אחרי שינויים מאושרים וממתינים",
    description: "רואים בדיוק כמה שינויים אושרו, כמה ממתינים ומה הסכום הכולל.",
  },
  {
    icon: FileText,
    title: "הפקת PDF חתום",
    description: "מפיקים מסמך PDF חתום לכל שינוי — מוכן לשליחה או לשמירה.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            כל מה שבעל מקצוע צריך
          </h2>
          <p className="text-muted-foreground text-lg">
            ניהול שינויים מקצועי — מהתיעוד ועד החתימה.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl bg-card border border-border shadow-sm p-7 space-y-4">
              <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center bg-primary/10 border border-primary/20">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
