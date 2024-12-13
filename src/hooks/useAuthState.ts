import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, Session } from "@supabase/supabase-js";

export const useAuthState = () => {
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
};