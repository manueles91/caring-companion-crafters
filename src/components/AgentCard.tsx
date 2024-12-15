import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AgentAvatar from "./agent/AgentAvatar";
import AgentInteractionCount from "./agent/AgentInteractionCount";
import AgentActions from "./agent/AgentActions";

interface AgentCardProps {
  id: string;
  name: string;
  expertise: string;
  traits: string[];
  onSelect: () => void;
}

const AgentCard = ({ id, name, expertise, traits, onSelect }: AgentCardProps) => {
  const navigate = useNavigate();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  return (
    <Card 
      className="p-3 hover:shadow-lg transition-all duration-300 animate-fade-in cursor-pointer relative"
      onClick={() => navigate(`/chat?agent=${id}`)}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <AgentAvatar name={name} />
        <h3 className="text-base font-semibold line-clamp-1">{name}</h3>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {expertise}
        </Badge>
      </div>
      <div className="flex items-center justify-between mt-3">
        {session && <AgentInteractionCount agentId={id} />}
        <AgentActions id={id} session={session} />
      </div>
    </Card>
  );
};

export default AgentCard;