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
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "Please log in to continue",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
    };
    checkAuth();
  }, [navigate, toast]);

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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No authenticated session");

        const { data: agentData, error: agentError } = await supabase
          .from('agents')
          .select()
          .eq('id', agentId)
          .single();

        if (agentError) throw agentError;
        setAgent(agentData);

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

  const storeMessage = async (message: Message) => {
    if (!agent) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      const { error } = await supabase
        .from('messages')
        .insert({
          agent_id: agent.id,
          role: message.role,
          content: message.content,
          user_id: session.user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !agent) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await storeMessage(userMessage);

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

      await storeMessage(assistantMessage);
      
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