import React from "react";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentInteractionCountProps {
  agentId: string;
}

const AgentInteractionCount = ({ agentId }: AgentInteractionCountProps) => {
  const { data: interactionCount = 0 } = useQuery({
    queryKey: ['interactions', agentId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('role', 'user');
      
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <MessageSquare className="h-3 w-3" />
      <span>{interactionCount}</span>
    </div>
  );
};

export default AgentInteractionCount;