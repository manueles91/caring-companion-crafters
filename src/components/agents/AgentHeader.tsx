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
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      
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
      {!showCreateForm && (
        <Button onClick={handleCreateAgent} className="gap-2 ml-auto">
          <Plus className="h-4 w-4" />
          {t("agents.newAgent")}
        </Button>
      )}
    </div>
  );
};

export default AgentHeader;