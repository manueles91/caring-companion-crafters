import React from "react";
import { Badge } from "../ui/badge";
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

interface PersonalityTraitsProps {
  selectedTraits: string[];
  onToggleTrait: (trait: string) => void;
}

const PersonalityTraits = ({ selectedTraits, onToggleTrait }: PersonalityTraitsProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Rasgos de Personalidad</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {PERSONALITY_TRAITS.map((trait) => (
          <Badge
            key={trait}
            variant={selectedTraits.includes(trait) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:opacity-80"
            onClick={() => onToggleTrait(trait)}
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
  );
};

export default PersonalityTraits;