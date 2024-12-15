import React, { useState } from "react";
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
  titleKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
}

const FeaturesCarousel = () => {
  const { t } = useLanguage();
  const [api, setApi] = useState<any>(null);
  
  const features: Feature[] = [
    {
      id: "knowledge-base",
      titleKey: "features.knowledge.title",
      descriptionKey: "features.knowledge.description",
      icon: <BookOpen className="w-6 h-6" />,
    },
    {
      id: "long-memory",
      titleKey: "features.memory.title",
      descriptionKey: "features.memory.description",
      icon: <Brain className="w-6 h-6" />,
    },
    {
      id: "customization",
      titleKey: "features.customization.title",
      descriptionKey: "features.customization.description",
      icon: <Rocket className="w-6 h-6" />,
    },
    {
      id: "personality",
      titleKey: "features.personality.title",
      descriptionKey: "features.personality.description",
      icon: <UserPlus className="w-6 h-6" />,
    },
    {
      id: "analytics",
      titleKey: "features.analytics.title",
      descriptionKey: "features.analytics.description",
      icon: <ChartBar className="w-6 h-6" />,
    },
  ];

  const duplicatedFeatures = [...features, ...features];

  return (
    <div className="w-full">
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
                  <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow dark:shadow-none">
                    <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold dark:text-white">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-muted-foreground dark:text-gray-300">
                      {t(feature.descriptionKey)}
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