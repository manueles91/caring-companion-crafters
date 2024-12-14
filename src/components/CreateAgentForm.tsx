import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { validateAgentForm } from "@/utils/agentFormValidation";
import { createAgent, updateAgent } from "@/utils/agentFormSubmission";
import AgentFormFields from "./agents/AgentFormFields";

interface CreateAgentFormProps {
  agentId?: string | null;
}

const CreateAgentForm = ({ agentId }: CreateAgentFormProps) => {
  const [selectedTraits, setSelectedTraits] = React.useState<string[]>([]);
  const [name, setName] = React.useState("");
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
      setDescription(agentData.description || '');
      setInstructions(agentData.instructions || '');
      setSelectedTraits(agentData.traits || []);
    }
  }, [agentData]);

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
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

  return (
    <Card className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="hover:bg-accent"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Volver</span>
        </Button>
        <h2 className="text-2xl font-semibold">
          {agentId ? "Editar Agente IA" : "Crear Nuevo Agente IA"}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <AgentFormFields
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          instructions={instructions}
          setInstructions={setInstructions}
          selectedTraits={selectedTraits}
          onToggleTrait={toggleTrait}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : agentId ? "Guardar Cambios" : "Crear Agente"}
        </Button>
      </form>
    </Card>
  );
};

export default CreateAgentForm;