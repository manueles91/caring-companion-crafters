import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export const useAuthState = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          navigate('/');
        }
      } catch (error) {
        const authError = error as AuthError;
        console.error('Session check error:', authError.message);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      switch (event) {
        case "SIGNED_IN":
          navigate('/');
          break;
        case "SIGNED_OUT":
          navigate('/auth');
          break;
        case "USER_UPDATED":
          if (session) {
            toast({
              title: "Profile Updated",
              description: "Your profile has been updated successfully.",
            });
          }
          break;
        case "PASSWORD_RECOVERY":
          toast({
            title: "Password Recovery",
            description: "Please check your email for password reset instructions.",
          });
          break;
        case "USER_DELETED":
          navigate('/auth');
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);
};