import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateAgentButton } from "./navigation/CreateAgentButton";
import { NavigationMenu } from "./navigation/NavigationMenu";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface NavigationProps {
  session: any;
}

export const Navigation = ({ session }: NavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  
  const showCreateForm = location.pathname === "/" && new URLSearchParams(location.search).get("create") === "true";
  const isEditingAgent = location.pathname === "/" && new URLSearchParams(location.search).get("edit");
  const showBackButton = showCreateForm || isEditingAgent;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-accent mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          <h1 className="text-xl font-bold">{t("nav.title")}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <CreateAgentButton session={session} showCreateForm={showCreateForm} />
          <LanguageSelector />
          <NavigationMenu 
            session={session}
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      </div>
    </nav>
  );
};