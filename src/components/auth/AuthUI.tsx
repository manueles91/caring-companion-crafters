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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate('/');
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === 'USER_UPDATED') {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    });

    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/');
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
        redirectTo={window.location.origin}
        localization={{
          variables: {
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create a password',
              button_label: 'Create account',
              loading_button_label: 'Creating account...',
              social_provider_text: 'Sign up with {{provider}}',
              link_text: 'Don\'t have an account? Sign up',
            },
            sign_in: {
              email_label: 'Email address',
              password_label: 'Your password',
              button_label: 'Sign in',
              loading_button_label: 'Signing in...',
              social_provider_text: 'Sign in with {{provider}}',
              link_text: 'Already have an account? Sign in',
            },
            forgotten_password: {
              link_text: 'Forgot password?',
              email_label: 'Email address',
              password_label: 'Your password',
              button_label: 'Send reset instructions',
              loading_button_label: 'Sending reset instructions...',
              confirmation_text: 'Check your email for the password reset link',
            },
          },
        }}
        theme="light"
      />
    </div>
  );
};

export default AuthUI;