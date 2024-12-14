import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export const AuthForm = () => {
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        });
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Password Recovery",
          description: "Check your email for password reset instructions.",
        });
      } else if (event === "USER_UPDATED") {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return (
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
      view="sign_in"
      showLinks={true}
      redirectTo={window.location.origin}
      onError={(error) => {
        console.error('Auth error:', error);
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Authentication Error",
            description: "Invalid credentials. Please check your email and password.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }}
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
          forgotten_password: {
            link_text: 'Forgot password?',
            button_label: 'Send reset instructions',
            loading_button_label: 'Sending reset instructions...',
            confirmation_text: 'Check your email for the password reset link',
          },
        },
      }}
    />
  );
};