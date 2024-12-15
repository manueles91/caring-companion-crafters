import React from "react";
import AgentCard from "@/components/AgentCard";
import { Agent } from "@/types/agent";

interface GridViewProps {
  agents: Agent[];
}

const GridView = ({ agents }: GridViewProps) => {
  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-3 gap-3">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            expertise={agent.expertise}
            traits={agent.traits || []}
            onSelect={() => console.log("Selected agent:", agent.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default GridView;