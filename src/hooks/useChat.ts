import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message, Agent } from "@/types/chat";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const useChat = (agentId: string | null) => {
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const guestId = localStorage.getItem('guestId');
        if (!guestId) {
          toast({
            title: "Error",
            description: "Guest access not available",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Check guest interaction count
        const { data: interactions, error } = await supabase
          .from('guest_interactions')
          .select('interaction_count')
          .eq('guest_id', guestId)
          .eq('agent_id', agentId)
          .single();

        if (!error && interactions?.interaction_count >= 5) {
          toast({
            title: "Sign up required",
            description: "You've reached the maximum number of messages as a guest. Please sign up to continue.",
          });
          navigate("/");
          return;
        }
      }
    };
    checkAccess();
  }, [navigate, toast, agentId]);

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
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('role, content')
            .eq('agent_id', agentId)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;
          
          const typedMessages: Message[] = messagesData.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }));
          
          setMessages(typedMessages);
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

  const updateGuestInteraction = async () => {
    const guestId = localStorage.getItem('guestId');
    if (!guestId || !agent) return;

    const { data, error } = await supabase
      .from('guest_interactions')
      .select('*')
      .eq('guest_id', guestId)
      .eq('agent_id', agent.id)
      .single();

    if (error) {
      // If no record exists, create one
      await supabase
        .from('guest_interactions')
        .insert({
          guest_id: guestId,
          agent_id: agent.id,
          interaction_count: 1
        });
    } else {
      // Update existing record
      const newCount = (data.interaction_count || 0) + 1;
      await supabase
        .from('guest_interactions')
        .update({ interaction_count: newCount })
        .eq('id', data.id);

      if (newCount >= 5) {
        toast({
          title: "Sign up required",
          description: "You've reached the maximum number of messages as a guest. Please sign up to continue.",
        });
        navigate("/");
        return false;
      }
    }
    return true;
  };

  const storeMessage = async (message: Message) => {
    if (!agent) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error } = await supabase
          .from('messages')
          .insert({
            agent_id: agent.id,
            role: message.role,
            content: message.content,
            user_id: session.user.id
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !agent) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const canProceed = await updateGuestInteraction();
      if (!canProceed) return;
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (session) {
        await storeMessage(userMessage);
      }

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage],
          agent: {
            name: agent.name,
            description: agent.description,
            instructions: agent.instructions,
            traits: agent.traits,
          },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.message 
      };

      if (session) {
        await storeMessage(assistantMessage);
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