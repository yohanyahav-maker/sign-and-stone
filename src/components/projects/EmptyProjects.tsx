export function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-3">
      <h2 className="text-lg font-bold text-foreground">אין פרויקטים עדיין</h2>
      <p className="text-muted-foreground text-sm max-w-xs">
        לחץ על + כדי ליצור את הפרויקט הראשון שלך
      </p>
    </div>
  );
}
