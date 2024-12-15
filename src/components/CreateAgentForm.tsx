import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import AgentFormFields from "./agents/AgentFormFields";
import { useAgentForm } from "@/hooks/useAgentForm";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      toast({
        title: "Agente eliminado",
        description: "El agente ha sido eliminado exitosamente",
      });

      navigate('/');
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el agente",
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

        <div className="flex gap-4 justify-center">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : agentId ? "Guardar Cambios" : "Crear Agente"}
          </Button>

          {agentId && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente el agente. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </Card>
  );
};

export default CreateAgentForm;