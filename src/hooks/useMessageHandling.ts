import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, Agent } from "@/types/chat";
import { messageService } from "@/services/messageService";

export const useMessageHandling = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loadMessages = async (agentId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const messages = await messageService.fetchUserMessages(agentId, session.user.id);
      setMessages(messages);
    }
  };

  const sendMessage = async (agent: Agent | null, shouldProceed: boolean = true) => {
    if (!input.trim() || !agent || !shouldProceed) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await messageService.storeMessage(userMessage, agent);
      }

      const assistantContent = await messageService.sendMessageToAgent([...messages, userMessage], {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        instructions: agent.instructions,
        traits: agent.traits,
      });
      
      const assistantMessage: Message = { 
        role: "assistant", 
        content: assistantContent 
      };

      if (session) {
        await messageService.storeMessage(assistantMessage, agent);
      }
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error en el chat:', error);
      toast({
        title: "Error",
        description: "Lo siento, no pude enviar tu mensaje. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    loadMessages,
    sendMessage
  };
};