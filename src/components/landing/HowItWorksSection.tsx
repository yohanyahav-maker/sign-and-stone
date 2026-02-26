const steps = [
  {
    num: 1,
    title: "מתעדים את השינוי",
    description: "מתארים את השינוי, מצלמים, בוחרים קטגוריה ומתמחרים — תוך דקה.",
  },
  {
    num: 2,
    title: "שולחים ללקוח",
    description: "הלקוח מקבל לינק בוואטסאפ, רואה את כל הפרטים עם תמונות ומחיר, ומחליט.",
  },
  {
    num: 3,
    title: "חתימה דיגיטלית",
    description: "חתימה מחייבת — השינוי ננעל, נשמר בענן, ומוכן להפקת PDF חתום.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            איך זה עובד?
          </h2>
          <p className="text-muted-foreground text-lg">
            תהליך פשוט ב-3 שלבים — מהשינוי ועד לחתימה.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {steps.map((step) => (
            <div key={step.num} className="text-center space-y-4">
              <div className="mx-auto w-[52px] h-[52px] rounded-full flex items-center justify-center text-lg font-extrabold bg-primary text-primary-foreground shadow-lg">
                {step.num}
              </div>
              <h3 className="font-bold text-xl text-foreground">{step.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
