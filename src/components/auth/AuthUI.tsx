import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      console.log("Session:", session);

      if (event === "SIGNED_IN") {
        // Verify profile creation
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session?.user?.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          toast({
            title: "Error",
            description: "There was an issue with your profile creation. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (profile) {
          console.log("Profile created successfully:", profile);
          toast({
            title: "Welcome!",
            description: "You have successfully signed in.",
          });
          navigate("/");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("Signed out");
      } else if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery requested");
      } else if (event === "INITIAL_SESSION") {
        console.log("Initial session");
        if (session) navigate("/");
      }

      // Handle invalid credentials error
      const error = session as any;
      if (error?.error?.message === "Invalid login credentials") {
        toast({
          title: "Authentication Error",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]);

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