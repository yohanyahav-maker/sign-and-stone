const problems = [
  {
    num: "01",
    title: "רודפים אחרי הלקוח לאישור",
    description:
      "שולחים הודעות, מתקשרים, מחכים ימים — ובסוף הלקוח אומר 'לא זוכר שסיכמנו'. כל יום עיכוב עולה כסף.",
  },
  {
    num: "02",
    title: "סיכום בעל-פה = סכסוך בסוף",
    description:
      "סיכמתם שינוי בעבודה? מעולה. אבל בלי חתימה — זה מילה מול מילה. וכשמגיעים לחשבון הסופי, הלקוח מכחיש.",
  },
  {
    num: "03",
    title: "אקסל ופתקים זה לא ניהול מקצועי",
    description:
      "טבלאות ישנות, הודעות בוואטסאפ, תמונות בגלריה — כשצריך להוכיח שינוי ספציפי, הכל מתפורר.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            הבעיות שכל בעל מקצוע מכיר
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            שינויים באמצע עבודה קורים כל הזמן.
            <br />
            אבל כשאין תיעוד מסודר – מתחילים ויכוחים.
          </p>
          <p className="text-muted-foreground text-base mt-3 leading-relaxed">
            סיכומים בעל פה, הודעות בוואטסאפ ותמונות בגלריה
            <br />
            לא באמת מגנים עליך כשמגיעים לחשבון הסופי.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {problems.map((p) => (
            <div key={p.num} className="rounded-2xl bg-background p-7 space-y-3 relative overflow-hidden card-shimmer" style={{ border: '1px solid var(--border-default)' }}>
              <span className="font-display text-5xl text-primary/30">
                {p.num}
              </span>
              <h3 className="font-bold text-[17px] text-foreground">{p.title}</h3>
              <p className="text-[15px] text-muted-foreground leading-relaxed">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;