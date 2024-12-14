import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AgentCard from "@/components/AgentCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentListProps {
  userRole: 'user' | 'creator' | null;
  onCreateAgent: () => void;
}

const AgentList = ({ userRole, onCreateAgent }: AgentListProps) => {
  const { t } = useLanguage();

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-2">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!agents?.length) {
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
  }

  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            traits={agent.traits || []}
            onSelect={() => console.log("Selected agent:", agent.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default AgentList;