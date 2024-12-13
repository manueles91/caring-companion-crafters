import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import CreateAgentForm from "@/components/CreateAgentForm";

const Index = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // Mock data for demonstration
  const agents = [
    {
      name: "Educational Assistant",
      description: "Helps children with homework and learning activities",
      traits: ["Educational", "Patient", "Encouraging"],
      interactions: 156,
    },
    {
      name: "Elder Care Companion",
      description: "Provides companionship and memory exercises for elderly",
      traits: ["Empathetic", "Supportive", "Structured"],
      interactions: 89,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
            <p className="text-muted-foreground">Create and manage your AI assistants</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Agent
          </Button>
        </div>

        {showCreateForm ? (
          <div className="mb-8">
            <CreateAgentForm />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, index) => (
              <AgentCard
                key={index}
                {...agent}
                onSelect={() => console.log("Selected agent:", agent.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;