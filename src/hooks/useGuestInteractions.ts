import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types/chat";

export const useGuestInteractions = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkGuestAccess = async (agentId: string | null) => {
    const guestId = localStorage.getItem('guestId');
    if (!guestId) {
      toast({
        title: "Error",
        description: "Guest access not available",
        variant: "destructive",
      });
      navigate("/");
      return false;
    }

    const { data: interactions } = await supabase
      .from('guest_interactions')
      .select('interaction_count')
      .eq('guest_id', guestId)
      .eq('agent_id', agentId)
      .maybeSingle();

    if (interactions?.interaction_count >= 5) {
      toast({
        title: "Sign up required",
        description: "You've reached the maximum number of messages as a guest. Please sign up to continue.",
      });
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
      navigate("/");
      return false;
    }

    return true;
  };

  const updateGuestInteraction = async (agent: Agent) => {
    const guestId = localStorage.getItem('guestId');
    if (!guestId) return false;

    const { data: existingInteraction } = await supabase
      .from('guest_interactions')
      .select('*')
      .eq('guest_id', guestId)
      .eq('agent_id', agent.id)
      .maybeSingle();

    if (!existingInteraction) {
      await supabase
        .from('guest_interactions')
        .insert({
          guest_id: guestId,
          agent_id: agent.id,
          interaction_count: 1
        });
    } else {
      const newCount = (existingInteraction.interaction_count || 0) + 1;
      await supabase
        .from('guest_interactions')
        .update({ interaction_count: newCount })
        .eq('id', existingInteraction.id);

      if (newCount >= 5) {
        toast({
          title: "Sign up required",
          description: "You've reached the maximum number of messages as a guest. Please sign up to continue.",
        });
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
        navigate("/");
        return false;
      }
    }
    return true;
  };

  return {
    checkGuestAccess,
    updateGuestInteraction,
  };
};