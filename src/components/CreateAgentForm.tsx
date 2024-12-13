import React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Plus, X } from "lucide-react";

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

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6">Crear Nuevo Agente IA</h2>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Nombre del Agente</label>
          <Input placeholder="Ingresa el nombre del agente..." />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Descripción</label>
          <Textarea 
            placeholder="Describe el propósito de tu agente..."
            className="resize-none"
            rows={4}
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
          />
        </div>

        <Button className="w-full">
          Crear Agente
        </Button>
      </div>
    </Card>
  );
};

export default CreateAgentForm;