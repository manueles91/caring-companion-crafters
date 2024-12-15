import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface NoAgentsViewProps {
  userRole: 'user' | 'creator' | null;
  onCreateAgent: () => void;
}

const NoAgentsView = ({ userRole, onCreateAgent }: NoAgentsViewProps) => {
  const { t } = useLanguage();

  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold mb-2">{t("agents.noAgents")}</h3>
      <p className="text-muted-foreground mb-4">
        {userRole === 'creator' 
          ? t("agents.noAgents.creator")
          : t("agents.noAgents.user")}
      </p>
      {userRole === 'creator' && (
        <Button onClick={onCreateAgent} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("agents.newAgent")}
        </Button>
      )}
    </div>
  );
};

export default NoAgentsView;