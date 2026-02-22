import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LandingNav = () => {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-black text-sm">שח</span>
          </div>
          <span className="font-black text-lg text-foreground">שינוי חתום</span>
        </div>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors">איך זה עובד</button>
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">פיצ'רים</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">מחיר</button>
          <button onClick={() => scrollTo("testimonials")} className="hover:text-foreground transition-colors">לקוחות</button>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-sm">
            כניסה
          </Button>
          <Button size="sm" onClick={() => navigate("/login")} className="text-sm font-semibold bg-foreground text-background hover:bg-foreground/90">
            התחל חינם
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
