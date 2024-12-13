import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string | null;
  traits: string[] | null;
}

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
        const { data, error } = await supabase
          .from('agents')
          .select()
          .eq('id', agentId)
          .single();

        if (error) throw error;
        setAgent(data);
      } catch (error) {
        console.error('Error al cargar el agente:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del agente",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    fetchAgent();
  }, [agentId, toast, navigate]);

  const handleSend = async () => {
    if (!input.trim() || !agent) return;

    const newMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, newMessage],
          agent: {
            name: agent.name,
            description: agent.description,
            instructions: agent.instructions,
            traits: agent.traits,
          },
        },
      });

      if (error) throw error;

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.message 
      }]);
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
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-4"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
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
