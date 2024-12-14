import React from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { MessageSquare, UserRound, Edit } from "lucide-react";
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

  const expertise = traits[0] || "General Assistant";

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement edit functionality
    console.log('Edit agent:', id);
  };

  return (
    <Card 
      className="p-3 hover:shadow-lg transition-all duration-300 animate-fade-in cursor-pointer relative"
      onClick={() => navigate(`/chat?agent=${id}`)}
    >
      <button
        onClick={handleEdit}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-accent hover:bg-accent/80 transition-colors"
      >
        <Edit className="h-4 w-4" />
      </button>
      <div className="flex flex-col items-center text-center space-y-2">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback>
            <UserRound className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-base font-semibold line-clamp-1">{name}</h3>
        <Badge variant="secondary" className="text-xs px-2 py-0.5">
          {expertise}
        </Badge>
      </div>
      <div className="flex items-center justify-center mt-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>{interactionCount}</span>
        </div>
      </div>
    </Card>
  );
};

export default AgentCard;