import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MoreHorizontal, MessageSquare, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  traits: string[];
  onSelect: () => void;
}

const AgentCard = ({ id, name, description, traits, onSelect }: AgentCardProps) => {
  const navigate = useNavigate();

  const { data: interactionCount = 0 } = useQuery({
    queryKey: ['interactions', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', id)
        .eq('role', 'user');
      
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {traits.map((trait, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {trait}
          </Badge>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{interactionCount}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={onSelect} variant="outline" className="gap-2">
            <Activity className="h-4 w-4" />
            Ver Estadísticas
          </Button>
          <Button 
            onClick={() => navigate(`/chat?agent=${id}`)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Chatear
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;