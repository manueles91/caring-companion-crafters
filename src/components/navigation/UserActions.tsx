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
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
      onAction();
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
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