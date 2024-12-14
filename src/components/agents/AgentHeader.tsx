import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AgentHeaderProps {
  userRole: 'user' | 'creator' | null;
  showCreateForm: boolean;
  onCreateAgent: () => void;
}

const AgentHeader = ({ userRole, showCreateForm, onCreateAgent }: AgentHeaderProps) => {
  const { t } = useLanguage();

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
      {userRole === 'creator' && !showCreateForm && (
        <Button onClick={onCreateAgent} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("agents.newAgent")}
        </Button>
      )}
    </div>
  );
};

export default AgentHeader;