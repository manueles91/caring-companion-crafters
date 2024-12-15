import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NoAgentsView from "./views/NoAgentsView";
import CarouselView from "./views/CarouselView";
import GridView from "./views/GridView";
import { Agent } from "@/types/agent";
import { useEffect } from "react";

interface AgentListProps {
  userRole: 'user' | 'creator' | null;
  onCreateAgent: () => void;
}

const AgentList = ({ userRole, onCreateAgent }: AgentListProps) => {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Listen for auth changes and invalidate queries
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Agent[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 px-2">
        {Array(3).fill(0).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (!agents?.length) {
    return <NoAgentsView userRole={userRole} onCreateAgent={onCreateAgent} />;
  }

  // Show carousel for signed out users
  if (!session) {
    return <CarouselView key="carousel" agents={agents} />;
  }

  // Show grid for signed in users
  return <GridView key="grid" agents={agents} />;
};

export default AgentList;