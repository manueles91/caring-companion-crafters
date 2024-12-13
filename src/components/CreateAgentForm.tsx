import React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Plus, X } from "lucide-react";

const PERSONALITY_TRAITS = [
  "Friendly",
  "Patient",
  "Educational",
  "Supportive",
  "Encouraging",
  "Empathetic",
  "Playful",
  "Structured",
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
      <h2 className="text-2xl font-semibold mb-6">Create New AI Agent</h2>
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Agent Name</label>
          <Input placeholder="Enter agent name..." />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Description</label>
          <Textarea 
            placeholder="Describe your agent's purpose..."
            className="resize-none"
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Personality Traits</label>
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
          <label className="text-sm font-medium mb-2 block">Initial Instructions</label>
          <Textarea 
            placeholder="Provide initial instructions for your agent..."
            className="resize-none"
            rows={6}
          />
        </div>

        <Button className="w-full">
          Create Agent
        </Button>
      </div>
    </Card>
  );
};

export default CreateAgentForm;