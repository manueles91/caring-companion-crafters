import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateAgentButtonProps {
  session: any;
  showCreateForm: boolean;
}

export const CreateAgentButton = ({ session, showCreateForm }: CreateAgentButtonProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

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

  // Hide button when in create form or edit form
  const isEditingAgent = new URLSearchParams(window.location.search).get('edit');
  if (showCreateForm || isEditingAgent) return null;

  return (
    <Button 
      variant="ghost" 
      size="icon"
      onClick={handleCreateAgent}
      className="bg-green-500 text-white hover:bg-green-600 hover:translate-y-[1px] transform transition-all shadow-[0_4px_0_0_rgb(22,163,74)] hover:shadow-[0_2px_0_0_rgb(22,163,74)] active:translate-y-[2px] active:shadow-[0_0px_0_0_rgb(22,163,74)]"
    >
      <Plus className="h-5 w-5" />
      <span className="sr-only">{t("nav.createAgent")}</span>
    </Button>
  );
};