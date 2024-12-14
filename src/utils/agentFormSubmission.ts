import { supabase } from "@/integrations/supabase/client";

interface AgentFormData {
  name: string;
  description: string;
  instructions: string | null;
  traits: string[];
}

export const updateAgent = async (agentId: string, formData: AgentFormData) => {
  const { error } = await supabase
    .from('agents')
    .update({
      name: formData.name,
      description: formData.description,
      instructions: formData.instructions || null,
      traits: formData.traits,
    })
    .eq('id', agentId);

  if (error) throw error;
  return true;
};

export const createAgent = async (formData: AgentFormData, userId: string) => {
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      name: formData.name,
      description: formData.description,
      instructions: formData.instructions || null,
      traits: formData.traits,
      creator_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return agent;
};