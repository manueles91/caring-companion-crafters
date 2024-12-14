import React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PersonalityTraits from "./agents/PersonalityTraits";
import { useAgentData } from "@/hooks/useAgentData";

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

  const handleDataLoaded = (data: any) => {
    if (data) {
      setName(data.name);
      setDescription(data.description);
      setInstructions(data.instructions || '');
      setSelectedTraits(data.traits || []);
    }
  };

  useAgentData(agentId, handleDataLoaded);

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      if (agentId) {
        const { error } = await supabase
          .from('agents')
          .update({
            name,
            description,
            instructions: instructions || null,
            traits: selectedTraits,
          })
          .eq('id', agentId);

        if (error) throw error;

        toast({
          title: "¡Éxito!",
          description: "Agente actualizado correctamente",
        });
      } else {
        const { data: agent, error } = await supabase
          .from('agents')
          .insert({
            name,
            description,
            instructions: instructions || null,
            traits: selectedTraits,
            creator_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;

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
      if (agentId) {
        navigate('/');
      }
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-semibold">
          {agentId ? "Editar Agente IA" : "Crear Nuevo Agente IA"}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre del Agente *</label>
          <Input 
            placeholder="Ingresa el nombre del agente..." 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Descripción *</label>
          <Textarea 
            placeholder="Describe el propósito de tu agente..."
            className="resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <PersonalityTraits 
          selectedTraits={selectedTraits}
          onToggleTrait={toggleTrait}
        />

        <div>
          <label className="text-sm font-medium mb-2 block">Instrucciones Iniciales</label>
          <Textarea 
            placeholder="Proporciona instrucciones iniciales para tu agente..."
            className="resize-none"
            rows={6}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

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