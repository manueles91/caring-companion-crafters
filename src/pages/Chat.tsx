import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChatMessage from "@/components/chat/ChatMessage";
import { Message, Agent } from "@/types/chat";

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const Chat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const agentId = searchParams.get("agent");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = React.useRef<HTMLDivElement>(null);

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

        // Fetch previous messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('role, content')
          .eq('agent_id', agentId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData);
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
      const { error } = await supabase
        .from('messages')
        .insert({
          agent_id: agent.id,
          role: message.role,
          content: message.content,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
      // We don't show this error to the user as it's not critical for the chat experience
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !agent) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Store user message
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

      // Store assistant message
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

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!agent) {
    return (
      <div className="container mx-auto max-w-4xl p-4 text-center">
        <p>Cargando agente...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
      <Card className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Chat con {agent.name}</h1>
        
        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-8"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
