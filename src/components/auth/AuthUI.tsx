import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_up");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        console.log("Signed in:", session);
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        console.log("Signed out");
      } else if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery requested");
      } else if (event === "INITIAL_SESSION") {
        console.log("Initial session");
        if (session) navigate("/");
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed");
      } else if (event === "USER_UPDATED") {
        console.log("User updated");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

  const handleError = (error: any) => {
    try {
      // Parse the error message if it's a string
      const errorBody = typeof error.message === 'string' ? JSON.parse(error.message) : error;
      
      if (errorBody?.message === "Invalid login credentials") {
        toast({
          title: "Authentication Error",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else if (errorBody?.message === "User already registered") {
        setView("sign_in");
        toast({
          title: "Sign Up Error",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        // Generic error handling
        toast({
          title: "Error",
          description: errorBody?.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      // Fallback for unparseable errors
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
      <p className="text-center text-muted-foreground mb-6">
        Create an account or sign in to continue
      </p>
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#000000',
                brandAccent: '#333333',
              },
            },
          },
        }}
        providers={[]}
        view={view}
        theme="light"
        redirectTo={window.location.origin}
        onlyThirdPartyProviders={false}
        showLinks={true}
        onError={handleError}
      />
    </div>
  );
};

export default AuthUI;