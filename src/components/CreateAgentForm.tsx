import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import AgentFormFields from "./agents/AgentFormFields";
import { useAgentForm } from "@/hooks/useAgentForm";

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