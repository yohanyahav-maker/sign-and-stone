import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FooterSection = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-foreground text-background">
      {/* CTA band */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-6 py-14 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            מוכן להגן על הפרויקטים שלך?
          </h2>
          <p className="text-background/70 max-w-lg mx-auto">
            הצטרף לאלפי קבלנים שכבר מתעדים כל שינוי עם חתימה דיגיטלית.
          </p>
          <Button
            size="lg"
            className="text-base font-semibold px-8 h-14"
            onClick={() => navigate("/login")}
          >
            התחל ניסיון חינם — 14 יום
          </Button>
        </div>
      </div>

      {/* Footer links */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h3 className="text-xl font-black">שינוי חתום</h3>
            <p className="text-sm text-background/60 mt-1">
              ניהול שינויי חוזה לקבלני בנייה
            </p>
          </div>

          <div className="flex gap-6 text-sm text-background/60">
            <a href="#" className="hover:text-background transition-colors">
              יצירת קשר
            </a>
            <a href="#" className="hover:text-background transition-colors">
              תנאי שימוש
            </a>
            <a href="#" className="hover:text-background transition-colors">
              מדיניות פרטיות
            </a>
          </div>
        </div>

        <div className="text-center text-xs text-background/40 mt-8">
          © {new Date().getFullYear()} שינוי חתום. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
