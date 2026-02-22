const problems = [
  {
    num: "01",
    emoji: "😤",
    title: "רודפים אחרי בעל הבית לאישור",
    description:
      "שולחים הודעות, מתקשרים, מחכים ימים — ובסוף הלקוח אומר 'לא זוכר שסיכמנו'. כל יום עיכוב עולה כסף.",
  },
  {
    num: "02",
    emoji: "🤝",
    title: "סיכום בעל-פה = סכסוך בגמר",
    description:
      "סיכמתם שינוי באתר? מעולה. אבל בלי חתימה — זה מילה מול מילה. וכשמגיעים לחשבון הסופי, הלקוח מכחיש.",
  },
  {
    num: "03",
    emoji: "📋",
    title: "אקסל ופתקים זה לא ניהול בנייה",
    description:
      "טבלאות ישנות, הודעות בוואטסאפ, תמונות בגלריה — כשצריך להוכיח שינוי ספציפי, הכל מתפורר.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            הבעיות שכל קבלן בנייה מכיר
          </h2>
          <p className="text-muted-foreground text-lg">
            בלי מערכת מסודרת, כל שינוי בפרויקט בנייה הוא פצצה מתקתקת.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((p) => (
            <div key={p.num} className="rounded-2xl border border-border bg-card p-6 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground bg-secondary rounded-full w-8 h-8 flex items-center justify-center">
                  {p.num}
                </span>
                <span className="text-2xl">{p.emoji}</span>
              </div>
              <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
