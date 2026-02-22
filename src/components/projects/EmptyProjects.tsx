import { FolderOpen } from "lucide-react";

export function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
      <div className="rounded-full bg-muted p-4">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold">אין פרויקטים עדיין</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        צור את הפרויקט הראשון שלך כדי להתחיל לנהל שינויי חוזה
      </p>
    </div>
  );
}
