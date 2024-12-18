import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const AuthUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

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

      // Handle invalid credentials error from response
      const error = session as any;
      if (error?.error?.message === "Invalid login credentials") {
        toast({
          title: t("auth.error.title"),
          description: t("auth.error.invalidCredentials"),
          variant: "destructive",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate, t]);

  return (
    <div className="max-w-md w-full mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-2">{t("auth.welcome")}</h2>
      <p className="text-center text-muted-foreground mb-6">
        {t("auth.subtitle")}
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
        view="sign_up"
        theme="light"
        redirectTo={window.location.origin}
        onlyThirdPartyProviders={false}
        showLinks={true}
      />
    </div>
  );
};

export default AuthUI;