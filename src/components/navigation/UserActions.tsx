import React from "react";
import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserActionsProps {
  session: any;
  onAction: () => void;
}

export const UserActions = ({ session, onAction }: UserActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        if (error.message.includes('session_not_found')) {
          // If session is invalid, clear local storage and refresh
          localStorage.clear();
          window.location.reload();
        } else {
          throw error;
        }
      }

      toast({
        title: "Signed out successfully",
      });
      
      navigate("/");
      onAction();
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
      
      // Force clear session and refresh as fallback
      localStorage.clear();
      window.location.reload();
    }
  };

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
    onAction();
  };

  return session ? (
    <Button 
      variant="ghost" 
      className="justify-start gap-2"
      onClick={handleSignOut}
    >
      <LogOut className="h-5 w-5" />
      {t("nav.signOut")}
    </Button>
  ) : (
    <Button 
      variant="ghost" 
      className="justify-start gap-2"
      onClick={scrollToAuth}
    >
      <LogIn className="h-5 w-5" />
      Sign In
    </Button>
  );
};