import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

interface AgentAvatarProps {
  name: string;
}

const AgentAvatar = ({ name }: AgentAvatarProps) => {
  const placeholderImages = [
    'photo-1649972904349-6e44c42644a7',
    'photo-1486312338219-ce68d2c6f44d',
    'photo-1581091226825-a6a2a5aee158',
    'photo-1581092795360-fd1ca04f0952'
  ];
  
  const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  const avatarUrl = `https://images.unsplash.com/${randomImage}`;

  return (
    <Avatar className="w-16 h-16">
      <AvatarImage src={avatarUrl} alt={name} />
      <AvatarFallback>
        <UserRound className="w-8 h-8" />
      </AvatarFallback>
    </Avatar>
  );
};

export default AgentAvatar;