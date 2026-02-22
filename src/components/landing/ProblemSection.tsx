import { MessageCircleOff, FileX, Banknote, Gavel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const problems = [
  {
    icon: MessageCircleOff,
    title: "שינויים בעל פה",
    description: "סיכומים שנעשים בשטח בלי תיעוד הופכים למילה נגד מילה.",
  },
  {
    icon: FileX,
    title: "חוסר תיעוד",
    description: "בלי מסמך חתום, אין הוכחה שהלקוח אישר את השינוי.",
  },
  {
    icon: Banknote,
    title: "מחלוקות כספיות",
    description: 'לקוח שטוען "לא סיכמנו על המחיר הזה" — וזה קורה שוב ושוב.',
  },
  {
    icon: Gavel,
    title: "סכסוכים משפטיים",
    description: "כשאין תיעוד, הקבלן הוא תמיד הצד המפסיד בבית המשפט.",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            הבעיות שכל קבלן מכיר
          </h2>
          <p className="text-muted-foreground text-lg">
            בלי מערכת מסודרת, כל שינוי בפרויקט הוא פצצה מתקתקת.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {problems.map((problem) => (
            <Card
              key={problem.title}
              className="border border-border bg-card hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <problem.icon className="h-7 w-7 text-destructive" />
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
