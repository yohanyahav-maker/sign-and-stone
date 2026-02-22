const FooterSection = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-black text-xs">שח</span>
            </div>
            <span className="font-bold text-foreground">שינוי חתום</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">יצירת קשר</a>
            <a href="#" className="hover:text-foreground transition-colors">תנאי שימוש</a>
            <a href="#" className="hover:text-foreground transition-colors">פרטיות</a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} שינוי חתום. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
};

export default FooterSection;
