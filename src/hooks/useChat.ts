import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, Agent } from "@/types/chat";
import { isValidUUID } from "@/utils/validation";
import { useGuestInteractions } from "./useGuestInteractions";
import { messageService } from "@/services/messageService";

export const useChat = (agentId: string | null) => {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkGuestAccess, updateGuestInteraction } = useGuestInteractions();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const hasAccess = await checkGuestAccess(agentId);
        if (!hasAccess) return;
      }
    };
    checkAccess();
  }, [agentId]);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) {
        toast({
          title: "Error",
          description: "No se especificó ningún agente",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (!isValidUUID(agentId)) {
        toast({
          title: "Error",
          description: "ID de agente inválido",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      try {
        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select()
          .eq('id', agentId)
          .single();

        if (agentError) throw agentError;
        setAgent(agentData);

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const messages = await messageService.fetchUserMessages(agentId, session.user.id);
          setMessages(messages);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    fetchAgent();
  }, [agentId, toast, navigate]);

  const handleSend = async () => {
    if (!input.trim() || !agent) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const canProceed = await updateGuestInteraction(agent);
      if (!canProceed) return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (session) {
        await messageService.storeMessage(userMessage, agent);
      }

      const assistantContent = await messageService.sendMessageToAgent([...messages, userMessage], agent);
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
    agent,
    messages,
    input,
    setInput,
    isLoading,
    handleSend
  };
};