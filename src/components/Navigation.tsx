import React from "react";
import { Menu, LogOut, Plus, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "./ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";

interface NavigationProps {
  session: any;
}

export const Navigation = ({ session }: NavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const showCreateForm = location.pathname === "/" && new URLSearchParams(location.search).get("create") === "true";

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  const handleCreateAgent = () => {
    if (!session) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to create your own agents",
      });
      return;
    }
    navigate("/?create=true");
  };

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("nav.title")}</h1>
        
        <div className="flex items-center gap-2">
          {!showCreateForm && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCreateAgent}
              className="bg-green-500 text-white hover:bg-green-600 hover:translate-y-[1px] transform transition-all shadow-[0_4px_0_0_rgb(22,163,74)] hover:shadow-[0_2px_0_0_rgb(22,163,74)] active:translate-y-[2px] active:shadow-[0_0px_0_0_rgb(22,163,74)]"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">{t("nav.createAgent")}</span>
            </Button>
          )}
          <LanguageSelector />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {session ? (
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
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};