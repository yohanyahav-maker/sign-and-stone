const companies = [
  "קבוצת שרון בנייה",
  "א. לוי קבלנות",
  "יונתן פרויקטים",
  "כרמל שיפוצים",
  "ב.ר. בנייה ירוקה",
];

const LogosSection = () => {
  return (
    <section className="py-12 border-y border-border bg-secondary">
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-muted-foreground mb-6">
          סומכים עלינו
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {companies.map((name) => (
            <div
              key={name}
              className="rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-muted-foreground"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosSection;
