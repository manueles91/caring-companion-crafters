import React from "react";
import AgentCard from "@/components/AgentCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Agent } from "@/types/agent";

interface CarouselViewProps {
  agents: Agent[];
}

const CarouselView = ({ agents }: CarouselViewProps) => {
  return (
    <div className="container mx-auto relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          slidesToScroll: 1,
          containScroll: "trimSnaps"
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {agents.map((agent) => (
            <CarouselItem key={agent.id} className="pl-2 md:pl-4 basis-[40%] md:basis-[33%] lg:basis-[25%]">
              <AgentCard
                id={agent.id}
                name={agent.name}
                expertise={agent.expertise}
                traits={agent.traits || []}
                onSelect={() => console.log("Selected agent:", agent.name)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden sm:block">
          <CarouselPrevious className="-left-12" />
          <CarouselNext className="-right-12" />
        </div>
      </Carousel>
    </div>
  );
};

export default CarouselView;