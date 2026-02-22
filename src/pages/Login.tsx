import { EmailAuthForm } from "@/components/auth/EmailAuthForm";

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight">שינוי חתום</h1>
          <p className="text-muted-foreground text-sm">
            הזן אימייל וסיסמה לכניסה
          </p>
        </div>

        <EmailAuthForm />
      </div>
    </div>
  );
};

export default Login;
