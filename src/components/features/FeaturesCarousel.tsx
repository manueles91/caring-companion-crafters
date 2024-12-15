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
      id: "create-agents",
      title: t("features.createAgents.title"),
      description: t("features.createAgents.description"),
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      id: "knowledge-base",
      title: t("features.knowledgeBase.title"),
      description: t("features.knowledgeBase.description"),
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      id: "long-memory",
      title: t("features.longMemory.title"),
      description: t("features.longMemory.description"),
      icon: <Brain className="w-6 h-6" />,
    },
    {
      id: "reports",
      title: t("features.reports.title"),
      description: t("features.reports.description"),
      icon: <ChartBar className="w-6 h-6" />,
    },
    {
      id: "customization",
      title: t("features.customization.title"),
      description: t("features.customization.description"),
      icon: <Rocket className="w-6 h-6" />,
    },
  ];

  // Duplicate features array to create a seamless loop effect
  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="w-full py-12 bg-secondary/50">
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
                  <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
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