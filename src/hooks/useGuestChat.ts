import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/types/chat";
import { useGuestInteractions } from "./useGuestInteractions";

export const useGuestChat = (agent: Agent | null) => {
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const { checkGuestAccess, updateGuestInteraction } = useGuestInteractions();
  const { toast } = useToast();
  const navigate = useNavigate();

  const checkGuestStatus = async (agentId: string | null) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const hasAccess = await checkGuestAccess(agentId);
      if (!hasAccess) return false;
    }
    return true;
  };

  const handleGuestMessage = async () => {
    if (!agent) return false;

    const guestId = localStorage.getItem('guestId');
    if (guestId) {
      const { data: interactions } = await supabase
        .from('guest_interactions')
        .select('interaction_count')
        .eq('guest_id', guestId)
        .eq('agent_id', agent.id)
        .maybeSingle();

      // Show prompt if there's already one interaction (before second message)
      if (interactions?.interaction_count === 1) {
        setShowGuestPrompt(true);
        return false;
      }
    }

    const canProceed = await updateGuestInteraction(agent);
    return canProceed;
  };

  const handleContinueAsGuest = async () => {
    setShowGuestPrompt(false);
    if (!agent) return false;
    
    // Update the interaction count and check if we can proceed
    const canProceed = await updateGuestInteraction(agent);
    return canProceed;
  };

  return {
    showGuestPrompt,
    setShowGuestPrompt,
    checkGuestStatus,
    handleGuestMessage,
    handleContinueAsGuest
  };
};