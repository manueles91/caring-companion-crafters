import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

interface AgentHeaderProps {
  userRole: 'user' | 'creator' | null;
  showCreateForm: boolean;
  onCreateAgent: () => void;
  session: any;
}

const AgentHeader = ({ userRole, showCreateForm, onCreateAgent, session }: AgentHeaderProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleCreateAgent = () => {
    if (!session) {
      // Scroll to auth section
      const authSection = document.getElementById('auth-section');
      if (authSection) {
        authSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      toast({
        title: "Sign in required",
        description: "Please sign in or create an account to create your own agents",
        variant: "default",
      });
      return;
    }
    
    onCreateAgent();
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">{t("agents.title")}</h1>
        <p className="text-muted-foreground">
          {userRole === 'creator' 
            ? t("agents.subtitle.creator")
            : t("agents.subtitle.user")}
        </p>
      </div>
      {!showCreateForm && (
        <Button onClick={handleCreateAgent} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("agents.newAgent")}
        </Button>
      )}
    </div>
  );
};

export default AgentHeader;