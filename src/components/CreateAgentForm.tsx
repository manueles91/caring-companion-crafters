import React from "react";
import { Card } from "./ui/card";
import AgentFormFields from "./agents/AgentFormFields";
import AgentFormActions from "./agents/AgentFormActions";
import { useAgentForm } from "@/hooks/useAgentForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CreateAgentFormProps {
  agentId?: string | null;
}

const CreateAgentForm = ({ agentId }: CreateAgentFormProps) => {
  const { formState, formActions } = useAgentForm(agentId);
  const { 
    name, 
    expertise, 
    description, 
    instructions, 
    selectedTraits, 
    isSubmitting 
  } = formState;
  
  const { 
    setName, 
    setExpertise, 
    setDescription, 
    setInstructions, 
    toggleTrait, 
    handleSubmit 
  } = formActions;

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!agentId) return;

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);

      // Get the agent details to verify creator
      const { data: agent } = await supabase
        .from('agents')
        .select('creator_id')
        .eq('id', agentId)
        .single();
      
      console.log('Agent details:', agent);
      console.log('Current user ID:', session?.user?.id);

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) {
        console.error('Error deleting agent:', error);
        throw error;
      }

      toast({
        title: "Agente eliminado",
        description: "El agente ha sido eliminado exitosamente",
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el agente. Verifica que seas el creador.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto animate-fade-in text-center">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {agentId ? "Editar Agente IA" : "Crear Nuevo Agente IA"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <AgentFormFields
          name={name}
          setName={setName}
          expertise={expertise}
          setExpertise={setExpertise}
          description={description}
          setDescription={setDescription}
          instructions={instructions}
          setInstructions={setInstructions}
          selectedTraits={selectedTraits}
          onToggleTrait={toggleTrait}
        />

        <AgentFormActions
          isSubmitting={isSubmitting}
          isEditing={!!agentId}
          onCancel={() => navigate('/')}
          onDelete={handleDelete}
        />
      </form>
    </Card>
  );
};

export default CreateAgentForm;