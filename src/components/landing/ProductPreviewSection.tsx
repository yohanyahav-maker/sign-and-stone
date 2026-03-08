import { CheckCircle2, FileText, Calendar, PenTool } from "lucide-react";

const ProductPreviewSection = () => {
  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-6 max-w-3xl space-y-6 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-foreground">
          כך נראה <span className="text-primary">שינוי חתום</span> בפועל
        </h2>
        <p className="text-muted-foreground text-base">
          כך נראה שינוי שנשלח ללקוח, מאושר ונחתם דיגיטלית.
        </p>

        {/* Mock signed change card */}
        <div className="mx-auto max-w-md text-right">
          <div className="rounded-2xl border border-success/30 bg-card shadow-lg overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border space-y-1">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold bg-success/15 text-success border border-success/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  שינוי חתום
                </span>
                <h3 className="font-bold text-sm">תוספת נקודת חשמל בסלון</h3>
              </div>
              <p className="text-xs text-muted-foreground">שיפוץ דירה — דוד כהן</p>
            </div>

            {/* Details */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">תיאור:</span>
                <span className="font-medium">הוספת 2 נקודות חשמל + חציבה וטיח</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">מחיר כולל מע״מ:</span>
                <span className="font-bold text-foreground">₪2,106</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  תאריך חתימה:
                </span>
                <span className="font-medium">8 במרץ 2026</span>
              </div>
            </div>

            {/* Signature area */}
            <div className="px-5 py-4 border-t border-border bg-success/5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <PenTool className="h-3 w-3" />
                  חתימת לקוח:
                </span>
                <span className="font-semibold text-foreground">דוד כהן</span>
              </div>
              <div className="h-12 rounded-lg border border-dashed border-success/40 bg-background/50 flex items-center justify-center">
                <span className="font-display text-xl text-success/60 italic select-none">דוד כהן</span>
              </div>
            </div>

            {/* Branding */}
            <div className="px-5 py-2.5 bg-muted/50 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3" />
              מסמך חתום דיגיטלית באמצעות שינוי חתום
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPreviewSection;
