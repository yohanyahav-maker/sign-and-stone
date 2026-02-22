import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CtaSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-foreground text-background">
      <div className="container mx-auto px-6 text-center space-y-6 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-black">
          שינוי אחד חתום שווה יותר מאלף שיחות
        </h2>
        <p className="text-background/70 text-lg">
          הצטרף לקבלנים שכבר חוסכים זמן, כסף ועצבים.
        </p>
        <Button
          size="lg"
          className="h-14 px-10 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => navigate("/login")}
        >
          התחל חינם — 14 יום ניסיון
        </Button>
        <p className="text-sm text-background/50">
          ✓ ללא כרטיס אשראי &nbsp; ✓ ביטול בכל עת
        </p>
      </div>
    </section>
  );
};

export default CtaSection;
