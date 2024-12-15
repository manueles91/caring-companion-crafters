import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AgentActionsProps {
  id: string;
  name: string;
  session: any;
}

const AgentActions = ({ id, name, session }: AgentActionsProps) => {
  const navigate = useNavigate();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/?edit=${id}`);
  };

  const handleChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat?agent=${id}`);
  };

  if (session) {
    return (
      <button
        onClick={handleEdit}
        className="p-1.5 rounded-full bg-accent hover:bg-accent/80 transition-colors dark:bg-[#333333] dark:hover:bg-[#555555] dark:text-white"
      >
        <Edit className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <Button
        onClick={handleChat}
        className="w-[80%] bg-green-500 text-white hover:bg-green-600 hover:translate-y-[1px] transform transition-all shadow-[0_4px_0_0_rgb(22,163,74)] hover:shadow-[0_2px_0_0_rgb(22,163,74)] active:translate-y-[2px] active:shadow-[0_0px_0_0_rgb(22,163,74)]"
        size="sm"
      >
        Chat
      </Button>
    </div>
  );
};

export default AgentActions;