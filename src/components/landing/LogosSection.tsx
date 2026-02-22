const companies = [
  "בנייה מתקדמת",
  "אלומיניום פלוס",
  "מטבחי הגליל",
  "שיפוצי אליטה",
  "בנייה קלה ישראל",
  "יזמות נדל\"ן מרכז",
  "קבוצת בנייני העתיד",
  "אדריכלות ובנייה דרום",
  "מטבחי השרון",
  "אלומיניום מקצועי",
];

const LogosSection = () => {
  return (
    <section className="py-16 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-6">
        <p className="text-center text-muted-foreground text-sm font-medium mb-10">
          מהימנים על ידי אנשי מקצוע מובילים בענף
        </p>
      </div>

      {/* Scrolling logos */}
      <div className="relative">
        <div className="flex animate-scroll-logos gap-8">
          {[...companies, ...companies].map((name, i) => (
            <div
              key={i}
              className="flex-shrink-0 h-14 px-8 rounded-lg border border-border bg-card flex items-center justify-center"
            >
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosSection;
