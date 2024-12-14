import { SignIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const AuthUI = () => {
  const navigate = useNavigate();
  const currentDomain = window.location.origin;

  return (
    <div className="max-w-md w-full mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
      <p className="text-center text-muted-foreground mb-6">
        Sign in to continue
      </p>
      <SignIn 
        redirectUrl={currentDomain}
        routing="path"
        path="/auth"
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-black hover:bg-gray-800 text-sm normal-case",
          },
        }}
      />
    </div>
  );
};

export default AuthUI;