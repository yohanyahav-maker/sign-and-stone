import { useLocation, useNavigate } from "react-router-dom";
import { FolderOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/projects", label: "פרויקטים", icon: FolderOpen },
  { path: "/settings", label: "הגדרות", icon: Settings },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
