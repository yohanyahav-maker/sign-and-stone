import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import logoImg from "@/assets/logo.png";

const LandingNav = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logoImg} alt="שינוי חתום" className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors">איך זה עובד</button>
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">פיצ'רים</button>
          <button onClick={() => scrollTo("pricing")} className="hover:text-foreground transition-colors">מחיר</button>
          <button onClick={() => scrollTo("testimonials")} className="hover:text-foreground transition-colors">לקוחות</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label={theme === "dark" ? "מצב בהיר" : "מצב כהה"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
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
