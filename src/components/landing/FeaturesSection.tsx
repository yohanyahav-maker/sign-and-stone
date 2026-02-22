const features = [
  {
    title: "שליחה בוואטסאפ",
    description:
      "שולחים לבעל הבית לינק ישירות בוואטסאפ. הוא פותח, רואה את השינוי עם תמונות ומחיר, ומאשר — בלי להוריד אפליקציה.",
  },
  {
    title: "חתימה דיגיטלית מחייבת",
    description:
      "חתימה דיגיטלית עם תוקף משפטי. כל שינוי נשמר עם חותמת זמן, IP ופרטי החותם. מסמך שלא ניתן לערער עליו.",
  },
  {
    title: "דוחות פרויקט בנייה",
    description:
      "עוקבים אחרי כל השינויים, הסכומים וימי ההשפעה — ויודעים בדיוק כמה השתנה הפרויקט מהחוזה המקורי.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            כל מה שקבלן בנייה צריך
          </h2>
          <p className="text-muted-foreground text-lg">
            ניהול שינויי בנייה מקצועי — מהשלד ועד הגמרים.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((f) => (
            <div key={f.title} className="rounded-[14px] bg-background p-7 space-y-4 shadow-soft">
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
