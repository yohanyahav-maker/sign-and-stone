const FooterSection = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg text-foreground">
            שינוי <span className="text-primary">חתום</span>
          </span>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="mailto:info@shinui-hatum.co.il" className="hover:text-foreground transition-colors">יצירת קשר</a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()} שינוי חתום. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
