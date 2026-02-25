import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NewProjectSheet } from "@/components/projects/NewProjectSheet";
import { useState, useEffect } from "react";

const NewProject = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      navigate("/projects");
    }
  }, [open, navigate]);

  return (
    <div dir="rtl" className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/projects")} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors" style={{ border: '1px solid var(--border-default)' }}>
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">פרויקט חדש</h1>
      </div>
      <NewProjectSheet open={open} onOpenChange={setOpen} />
    </div>
  );
};

export default NewProject;
