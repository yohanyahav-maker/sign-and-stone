const companies = [
  "סטודיו לעיצוב פנים",
  "טכנאי מיזוג אוויר",
  "נגריית אומן",
  "חשמל ותקשורת",
  "שיפוצי פרימיום",
];

const LogosSection = () => {
  return (
    <section className="py-12 bg-card" style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container mx-auto px-6">
        <p className="text-center text-sm text-muted-foreground mb-6">
          סומכים עלינו
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {companies.map((name) => (
            <div
              key={name}
              className="rounded-full px-5 py-2 text-sm font-medium text-muted-foreground"
              style={{ border: '1px solid var(--border-default)', background: 'hsl(240 16% 12%)' }}
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