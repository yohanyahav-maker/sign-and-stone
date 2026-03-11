import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyProjects() {
  const navigate = useNavigate();

  return (
    <div
      dir="rtl"
      className="flex flex-col items-center justify-center py-24 px-6 text-center space-y-6"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-muted text-muted-foreground">
        <FolderOpen className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          הפרויקטים שלך מתחילים כאן
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
          הוסף פרויקט, שלח תוספות לאישור לקוח וקבל חתימה דיגיטלית — הכל במקום אחד
        </p>
      </div>
      <Button onClick={() => navigate("/projects/new")}>
        צור פרויקט ראשון
      </Button>
    </div>
  );
}