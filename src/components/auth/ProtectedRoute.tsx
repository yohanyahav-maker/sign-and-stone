import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: הגנה בוטלה זמנית לצפייה בדפים — להחזיר כשמפעילים auth
  return <>{children}</>;
}
