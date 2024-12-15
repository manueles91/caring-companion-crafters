import React from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import PersonalityTraits from "./PersonalityTraits";
import FileUpload from "./FileUpload";

interface AgentFormFieldsProps {
  name: string;
  setName: (value: string) => void;
  expertise: string;
  setExpertise: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  instructions: string;
  setInstructions: (value: string) => void;
  selectedTraits: string[];
  onToggleTrait: (trait: string) => void;
  agentId?: string | null;
}

const AgentFormFields = ({
  name,
  setName,
  expertise,
  setExpertise,
  description,
  setDescription,
  instructions,
  setInstructions,
  selectedTraits,
  onToggleTrait,
  agentId
}: AgentFormFieldsProps) => {
  return (
    <div className="space-y-6">
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
        <label className="text-sm font-medium mb-2 block">Tema/Expertise *</label>
        <Input 
          placeholder="Ingresa el tema o expertise principal..." 
          value={expertise}
          onChange={(e) => setExpertise(e.target.value)}
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
        onToggleTrait={onToggleTrait}
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

      {agentId && (
        <div>
          <label className="text-sm font-medium mb-2 block">Archivos de Conocimiento</label>
          <p className="text-sm text-muted-foreground mb-2">
            Sube archivos para que el agente pueda utilizarlos como base de conocimiento
          </p>
          <FileUpload agentId={agentId} />
        </div>
      )}
    </div>
  );
};

export default AgentFormFields;