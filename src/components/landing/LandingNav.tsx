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
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <span className="font-black text-lg text-foreground tracking-tight">שינוי חתום</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors">איך זה עובד</button>
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">פיצ'רים</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">מחיר</button>
          <button onClick={() => scrollTo("testimonials")} className="hover:text-foreground transition-colors">לקוחות</button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-sm text-muted-foreground">
            כניסה
          </Button>
          <Button size="sm" onClick={() => navigate("/login")} className="text-sm font-semibold">
            התחל חינם
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
