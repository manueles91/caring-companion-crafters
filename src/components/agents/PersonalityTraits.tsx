import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Plus, X } from "lucide-react";
import { Input } from "../ui/input";

const INITIAL_TRAITS = [
  "Empático",
  "Motivador",
  "Lógico",
  "Educativo",
  "Desafiante",
];

interface PersonalityTraitsProps {
  selectedTraits: string[];
  onToggleTrait: (trait: string) => void;
}

const PersonalityTraits = ({ selectedTraits, onToggleTrait }: PersonalityTraitsProps) => {
  const [newTrait, setNewTrait] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleAddNewTrait = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTrait.trim()) {
      onToggleTrait(newTrait.trim());
      setNewTrait("");
      setShowInput(false);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">Rasgos de Personalidad</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {INITIAL_TRAITS.map((trait) => (
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
        {selectedTraits
          .filter(trait => !INITIAL_TRAITS.includes(trait))
          .map((trait) => (
            <Badge
              key={trait}
              variant="default"
              className="cursor-pointer transition-all hover:opacity-80"
              onClick={() => onToggleTrait(trait)}
            >
              <X className="h-3 w-3 mr-1" />
              {trait}
            </Badge>
          ))}
        {showInput ? (
          <Input
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            onKeyDown={handleAddNewTrait}
            placeholder="Presiona Enter para agregar"
            className="w-48 h-7 text-sm"
            autoFocus
            onBlur={() => {
              if (!newTrait.trim()) {
                setShowInput(false);
              }
            }}
          />
        ) : (
          <Badge
            variant="outline"
            className="cursor-pointer transition-all hover:opacity-80"
            onClick={() => setShowInput(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar nuevo
          </Badge>
        )}
      </div>
    </div>
  );
};

export default PersonalityTraits;