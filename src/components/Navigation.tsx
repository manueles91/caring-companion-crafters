import { Menu, LogOut, Plus, ArrowLeft } from "lucide-react";
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
  const showCreateForm = location.pathname === "/" && new URLSearchParams(location.search).get("create") === "true";

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate("/");
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                <h2 className="text-lg font-semibold">{t("nav.title")}</h2>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-4">
            {showCreateForm ? (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/")}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            ) : null}
            <h1 className="text-xl font-bold">{t("nav.title")}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {session && !showCreateForm && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleCreateAgent}
              className="text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Create Agent</span>
            </Button>
          )}
          <LanguageSelector />
          {session && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">{t("nav.signOut")}</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};