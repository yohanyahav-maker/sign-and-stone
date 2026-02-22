import { MessageCircle, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "שליחה בוואטסאפ",
    description:
      "שולחים לבעל הבית לינק ישירות בוואטסאפ. הוא פותח, רואה את השינוי עם תמונות ומחיר, ומאשר — בלי להוריד אפליקציה.",
  },
  {
    icon: ShieldCheck,
    title: "חתימה דיגיטלית מחייבת",
    description:
      "חתימה דיגיטלית עם תוקף משפטי. כל שינוי נשמר עם חותמת זמן, IP ופרטי החותם. מסמך שלא ניתן לערער עליו.",
  },
  {
    icon: BarChart3,
    title: "דוחות פרויקט בנייה",
    description:
      "עוקבים אחרי כל השינויים, הסכומים וימי ההשפעה — ויודעים בדיוק כמה השתנה הפרויקט מהחוזה המקורי.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            כל מה שקבלן בנייה צריך
          </h2>
          <p className="text-muted-foreground text-lg">
            ניהול שינויי בנייה מקצועי — מהשלד ועד הגמרים.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <f.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-bold text-lg text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
