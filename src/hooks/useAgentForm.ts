import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { validateAgentForm } from "@/utils/agentFormValidation";
import { createAgent, updateAgent } from "@/utils/agentFormSubmission";

export const useAgentForm = (agentId?: string | null) => {
  const [selectedTraits, setSelectedTraits] = React.useState<string[]>([]);
  const [name, setName] = React.useState("");
  const [expertise, setExpertise] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: agentData } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!agentId
  });

  React.useEffect(() => {
    if (agentData) {
      setName(agentData.name || '');
      setExpertise(agentData.expertise || '');
      setDescription(agentData.description || '');
      setInstructions(agentData.instructions || '');
      setSelectedTraits(agentData.traits || []);
    }
  }, [agentData]);

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter((t) => t !== trait)
        : [...prev, trait]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateAgentForm(name, description);
    if (validationError) {
      toast({
        title: "Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const formData = {
        name,
        description,
        instructions: instructions || null,
        expertise,
        traits: selectedTraits,
      };

      if (agentId) {
        await updateAgent(agentId, formData);
        toast({
          title: "¡Éxito!",
          description: "Agente actualizado correctamente",
        });
        navigate('/');
      } else {
        const agent = await createAgent(formData, user.id);
        toast({
          title: "¡Éxito!",
          description: "Agente creado correctamente",
        });
        navigate(`/chat?agent=${agent.id}`);
      }
    } catch (error) {
      console.error('Error al crear/actualizar el agente:', error);
      toast({
        title: "Error",
        description: "No se pudo crear/actualizar el agente. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      name,
      expertise,
      description,
      instructions,
      selectedTraits,
      isSubmitting
    },
    formActions: {
      setName,
      setExpertise,
      setDescription,
      setInstructions,
      toggleTrait,
      handleSubmit
    }
  };
};