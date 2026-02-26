import { MessageSquare, ShieldCheck, BarChart3 } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "שליחה בוואטסאפ",
    description:
      "שולחים ללקוח לינק ישירות בוואטסאפ. הוא פותח, רואה את השינוי עם תמונות ומחיר, ומאשר — בלי להוריד אפליקציה.",
  },
  {
    icon: ShieldCheck,
    title: "חתימה דיגיטלית מחייבת",
    description:
      "חתימה דיגיטלית עם תוקף משפטי. כל שינוי נשמר עם חותמת זמן, IP ופרטי החותם. מסמך שלא ניתן לערער עליו.",
  },
  {
    icon: BarChart3,
    title: "דוחות ומעקב",
    description:
      "עוקבים אחרי כל השינויים, הסכומים וימי ההשפעה — ויודעים בדיוק כמה השתנתה העבודה מההצעה המקורית.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            כל מה שבעל מקצוע צריך
          </h2>
          <p className="text-muted-foreground text-lg">
            ניהול שינויים מקצועי — מהתיעוד ועד החתימה.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-card p-7 space-y-4 relative overflow-hidden card-shimmer" style={{ border: '1px solid var(--border-default)' }}>
              <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.20)' }}>
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