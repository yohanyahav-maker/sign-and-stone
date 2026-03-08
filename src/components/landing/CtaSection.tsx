import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden hero-grid blue-glow">
      <div className="container mx-auto px-6 text-center space-y-8 max-w-2xl relative z-10">
        <h2 className="font-display text-3xl md:text-4xl text-foreground">
          תעד את השינוי. שלח ללקוח. קבל <span className="text-primary">חתימה דיגיטלית</span>.
        </h2>
        <p className="text-muted-foreground text-lg">
          הכל במקום אחד — מהשינוי ועד לחתימה מחייבת.
        </p>
        <Button
          size="lg"
          className="h-14 px-10 text-base font-extrabold shadow-lg hover:shadow-xl transition-all"
          onClick={() => navigate("/login")}
        >
          צור שינוי ראשון בחינם
        </Button>
        <p className="text-sm text-muted-foreground">
          <span className="text-success">✓</span> ללא כרטיס אשראי · ניסיון חינם ל-14 יום
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
