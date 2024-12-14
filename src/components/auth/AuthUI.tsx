import { useAuthState } from "@/hooks/useAuthState";
import { AuthForm } from "./AuthForm";

const AuthUI = () => {
  useAuthState();

  return (
    <div className="max-w-md w-full mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
      <p className="text-center text-muted-foreground mb-6">
        Sign in to continue
      </p>
      <AuthForm />
    </div>
  );
};

export default AuthUI;