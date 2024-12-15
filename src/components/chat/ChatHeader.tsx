import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Agent } from "@/types/chat";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserRound } from "lucide-react";

interface ChatHeaderProps {
  agent: Agent | null;
}

const ChatHeader = ({ agent }: ChatHeaderProps) => {
  const navigate = useNavigate();

  const placeholderImages = [
    'photo-1649972904349-6e44c42644a7',
    'photo-1486312338219-ce68d2c6f44d',
    'photo-1581091226825-a6a2a5aee158',
    'photo-1581092795360-fd1ca04f0952'
  ];
  
  const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  const avatarUrl = `https://images.unsplash.com/${randomImage}`;

  return (
    <div className="mb-4 flex items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="hover:bg-accent"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back to agents</span>
      </Button>
      <div className="flex-1 flex items-center justify-center gap-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} alt={agent?.name} />
          <AvatarFallback>
            <UserRound className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">{agent?.name}</h1>
      </div>
      <div className="w-10" /> {/* Spacer to balance the back button */}
    </div>
  );
};

export default ChatHeader;
