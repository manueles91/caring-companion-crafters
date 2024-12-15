import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types/chat";
import { isValidUUID } from "@/utils/validation";
import { useGuestChat } from "./useGuestChat";
import { useMessageHandling } from "./useMessageHandling";

export const useChat = (agentId: string | null) => {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const { toast } = useToast();
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    loadMessages,
    sendMessage
  } = useMessageHandling();

  const {
    showGuestPrompt,
    setShowGuestPrompt,
    checkGuestStatus,
    handleGuestMessage,
    handleContinueAsGuest
  } = useGuestChat(agent);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await checkGuestStatus(agentId);
      if (!hasAccess) return;
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
        await loadMessages(agentId);
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const canProceed = await handleGuestMessage();
      if (!canProceed) return;
    }
    await sendMessage(agent);
  };

  return {
    agent,
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    showGuestPrompt,
    setShowGuestPrompt,
    handleContinueAsGuest
  };
};