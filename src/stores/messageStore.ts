import { create } from 'zustand';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

interface MessageState {
  messages: Message[];
  addMessage: (message: Message, agentId: string) => Promise<void>;
  fetchMessages: (agentId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  addMessage: async (message: Message, agentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      const { error } = await supabase
        .from('messages')
        .insert({
          agent_id: agentId,
          role: message.role,
          content: message.content,
          user_id: session.user.id
        });

      if (error) throw error;

      set((state) => ({
        messages: [...state.messages, message],
      }));
    } catch (error) {
      console.error('Error adding message:', error);
    }
  },
  fetchMessages: async (agentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No authenticated session");

      const { data, error } = await supabase
        .from('messages')
        .select('role, content')
        .eq('agent_id', agentId)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages: Message[] = data.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }));

      set({ messages: typedMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },
}));