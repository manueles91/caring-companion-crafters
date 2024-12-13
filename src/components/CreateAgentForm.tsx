import React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Plus, X } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PERSONALITY_TRAITS = [
  "Amigable",
  "Paciente",
  "Educativo",
  "Comprensivo",
  "Motivador",
  "Empático",
  "Juguetón",
  "Estructurado",
];

const CreateAgentForm = () => {
  const [selectedTraits, setSelectedTraits] = React.useState<string[]>([]);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [instructions, setInstructions] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const { data: agent, error } = await supabase
        .from('agents')
        .insert({
          name,
          description,
          instructions: instructions || null,
          traits: selectedTraits,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Agente creado correctamente",
      });

      // Navigate to chat with the new agent's ID
      navigate(`/chat?agent=${encodeURIComponent(agent.id)}`);
    } catch (error) {
      console.error('Error al crear el agente:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el agente. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6">Crear Nuevo Agente IA</h2>
      
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

        <div>
          <label className="text-sm font-medium mb-2 block">Rasgos de Personalidad</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {PERSONALITY_TRAITS.map((trait) => (
              <Badge
                key={trait}
                variant={selectedTraits.includes(trait) ? "default" : "outline"}
                className="cursor-pointer transition-all hover:opacity-80"
                onClick={() => toggleTrait(trait)}
              >
                {selectedTraits.includes(trait) ? (
                  <X className="h-3 w-3 mr-1" />
                ) : (
                  <Plus className="h-3 w-3 mr-1" />
                )}
                {trait}
              </Badge>
            ))}
          </div>
        </div>

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
          {isSubmitting ? "Creando..." : "Crear Agente"}
        </Button>
      </form>
    </Card>
  );
};

export default CreateAgentForm;