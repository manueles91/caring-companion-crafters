import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import GuestPromptDialog from "@/components/chat/GuestPromptDialog";
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const agentId = searchParams.get("agent");
  const { 
    agent, 
    messages, 
    input, 
    setInput, 
    isLoading, 
    handleSend,
    showGuestPrompt,
    setShowGuestPrompt,
    handleGuestContinue
  } = useChat(agentId);

  if (!agent) {
    return (
      <div className="container mx-auto max-w-4xl p-4 text-center">
        <p>Cargando agente...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
      <ChatHeader agent={agent} />
      <Card className="flex-1 p-4 flex flex-col">
        <ChatMessages messages={messages} />
        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          isLoading={isLoading}
        />
      </Card>
      <GuestPromptDialog
        open={showGuestPrompt}
        onClose={() => setShowGuestPrompt(false)}
        onContinue={handleGuestContinue}
      />
    </div>
  );
};

export default Chat;