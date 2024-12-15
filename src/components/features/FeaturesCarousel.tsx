import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { UserPlus, BookOpen, Brain, ChartBar, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeaturesCarousel = () => {
  const { t } = useLanguage();
  const [api, setApi] = useState<any>(null);
  
  const features: Feature[] = [
    {
      id: "knowledge-base",
      title: "Knowledge Base",
      description: "Upload files and images to enhance your assistant's knowledge and capabilities",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      id: "long-memory",
      title: "Continuous Learning",
      description: "Your assistant remembers and learns from every conversation to provide better responses",
      icon: <Brain className="w-6 h-6" />,
    },
    {
      id: "customization",
      title: "Custom Actions",
      description: "Define specific actions and capabilities for your assistant to perform",
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      id: "personality",
      title: "Personality Traits",
      description: "Shape your assistant's behavior and communication style to match your preferences",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      id: "analytics",
      title: "Performance Insights",
      description: "Track and analyze your assistant's interactions and effectiveness",
      icon: <ChartBar className="w-6 h-6" />,
    },
  ];

  // Duplicate features array to create a seamless loop effect
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="w-full bg-secondary/50 dark:bg-secondary/10">
      <div className="container">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full max-w-5xl mx-auto"
          setApi={setApi}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {duplicatedFeatures.map((feature, index) => (
              <CarouselItem
                key={`${feature.id}-${index}`}
                className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4"
              >
                <div className="p-4">
                  <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background dark:bg-[#1A1F2C] rounded-xl shadow-sm hover:shadow-md transition-shadow dark:shadow-none">
                    <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default FeaturesCarousel;