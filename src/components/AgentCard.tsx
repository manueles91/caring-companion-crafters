import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { MessageSquare, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentCardProps {
  id: string;
  name: string;
  traits: string[];
  onSelect: () => void;
}

const AgentCard = ({ id, name, traits, onSelect }: AgentCardProps) => {
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

  const placeholderImages = [
    'photo-1649972904349-6e44c42644a7',
    'photo-1486312338219-ce68d2c6f44d',
    'photo-1581091226825-a6a2a5aee158',
    'photo-1581092795360-fd1ca04f0952'
  ];
  
  const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  const avatarUrl = `https://images.unsplash.com/${randomImage}`;

  // Display only the first trait as expertise
  const expertise = traits[0] || "General Assistant";

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
        <Badge variant="secondary" className="text-sm">
          {expertise}
        </Badge>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{interactionCount}</span>
        </div>
        <Button 
          onClick={() => navigate(`/chat?agent=${id}`)}
          className="w-full ml-2"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat Now
        </Button>
      </div>
    </Card>
  );
};

export default AgentCard;