import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Agent } from "@/types/chat";

interface ChatHeaderProps {
  agent: Agent | null;
}

const ChatHeader = ({ agent }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/')}
        className="hover:bg-accent"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back to agents</span>
      </Button>
      <h1 className="text-2xl font-bold mb-4">Chat con {agent?.name}</h1>
    </div>
  );
};

export default ChatHeader;