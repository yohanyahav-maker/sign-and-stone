import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center justify-center bg-background px-6 gap-4">
      <h1 className="text-5xl font-black text-foreground">404</h1>
      <p className="text-lg text-muted-foreground">הדף לא נמצא</p>
      <Button size="lg" onClick={() => navigate("/projects", { replace: true })}>
        חזרה לדף הבית
      </Button>
    </div>
  );
};

export default NotFound;
