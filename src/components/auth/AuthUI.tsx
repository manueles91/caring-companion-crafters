import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthUI = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome!",
          description: "Successfully signed in.",
        });
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        // Handle sign out event
        toast({
          title: "Signed Out",
          description: "You have been signed out.",
        });
      }
    });

    // Handle auth errors
    const handleAuthError = (error: any) => {
      if (error.message?.includes('Invalid login credentials')) {
        toast({
          title: "Sign In Failed",
          description: "Incorrect email or password. Please try again.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Email not confirmed')) {
        toast({
          title: "Email Not Verified",
          description: "Please check your email and verify your account.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "An error occurred during authentication.",
          variant: "destructive",
        });
      }
    };

    // Subscribe to auth error events
    const authErrorSubscription = supabase.auth.onError(handleAuthError);

    return () => {
      subscription.unsubscribe();
      authErrorSubscription.unsubscribe();
    };
  }, [navigate, toast]);

  return (
    <div className="max-w-md w-full mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
      <p className="text-center text-muted-foreground mb-6">
        Sign in to continue
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
        redirectTo={window.location.origin}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email address',
              password_label: 'Password',
              button_label: 'Sign in',
              loading_button_label: 'Signing in...',
            },
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create a password (minimum 6 characters)',
              button_label: 'Sign up',
              loading_button_label: 'Creating account...',
            },
          },
        }}
        theme="light"
      />
    </div>
  );
};

export default AuthUI;