import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { MoreHorizontal, MessageSquare, Activity, UserRound } from "lucide-react";
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

  // Get a random placeholder image for the agent
  const placeholderImages = [
    'photo-1649972904349-6e44c42644a7',
    'photo-1486312338219-ce68d2c6f44d',
    'photo-1581091226825-a6a2a5aee158',
    'photo-1581092795360-fd1ca04f0952'
  ];
  
  const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  const avatarUrl = `https://images.unsplash.com/${randomImage}`;

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>
            <UserRound className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {traits.map((trait, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {trait}
          </Badge>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{interactionCount}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate(`/chat?agent=${id}`)}
            className="w-full"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;