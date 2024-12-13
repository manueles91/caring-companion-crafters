import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import CreateAgentForm from "@/components/CreateAgentForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const renderAgentCards = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      ));
    }

    if (!agents?.length) {
      return (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-4">Create your first AI agent to get started</p>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        </div>
      );
    }

    return agents.map((agent) => (
      <AgentCard
        key={agent.id}
        name={agent.name}
        description={agent.description}
        traits={agent.traits || []}
        interactions={0}
        onSelect={() => console.log("Selected agent:", agent.name)}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Agents</h1>
            <p className="text-muted-foreground">Create and manage your AI assistants</p>
          </div>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Agent
            </Button>
          )}
        </div>

        {showCreateForm ? (
          <div className="mb-8">
            <CreateAgentForm />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderAgentCards()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;