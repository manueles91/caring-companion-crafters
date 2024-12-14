import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const useAgentData = (agentId: string | null, onDataLoaded: (data: any) => void) => {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
    meta: {
      onSuccess: onDataLoaded
    }
  });
};