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
      
      switch (event) {
        case 'SIGNED_IN':
          toast({
            title: "Welcome!",
            description: "Successfully signed in.",
          });
          navigate('/');
          break;
        case 'SIGNED_OUT':
          toast({
            title: "Signed Out",
            description: "You have been signed out.",
          });
          break;
        case 'USER_UPDATED':
          console.log('User updated:', session);
          break;
        case 'PASSWORD_RECOVERY':
          toast({
            title: "Password Recovery",
            description: "Please check your email for password reset instructions.",
          });
          break;
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed');
          break;
        case 'MFA_CHALLENGE_VERIFIED':
          console.log('MFA verified');
          break;
        case 'INITIAL_SESSION':
          console.log('Initial session loaded');
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
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
              email_input_placeholder: 'Your email address',
              password_input_placeholder: 'Your password',
              link_text: 'Already have an account? Sign in',
            },
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create a password (minimum 6 characters)',
              button_label: 'Sign up',
              loading_button_label: 'Creating account...',
              email_input_placeholder: 'Your email address',
              password_input_placeholder: 'Your password',
              link_text: "Don't have an account? Sign up",
            },
          },
        }}
        onError={(error) => {
          console.error('Auth error:', error);
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: "Error",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "An error occurred. Please try again.",
              variant: "destructive",
            });
          }
        }}
        theme="light"
      />
    </div>
  );
};

export default AuthUI;