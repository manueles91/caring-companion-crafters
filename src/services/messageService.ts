import { supabase } from "@/integrations/supabase/client";
import { Message, Agent } from "@/types/chat";

export const messageService = {
  storeMessage: async (message: Message, agent: Agent) => {
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
  },

  fetchUserMessages: async (agentId: string, userId: string) => {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('agent_id', agentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (messagesError) throw messagesError;
    
    return messagesData.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    }));
  },

  sendMessageToAgent: async (messages: Message[], agent: Agent) => {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: {
        messages,
        agent: {
          name: agent.name,
          description: agent.description,
          instructions: agent.instructions,
          traits: agent.traits,
        },
      },
    });

    if (error) throw error;
    return data.message;
  }
};