import { Languages } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent hover:text-accent-foreground">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-border dark:bg-[#1A1F2C] dark:border-[#403E43]">
        <DropdownMenuItem 
          onClick={() => setLanguage('en')}
          className="hover:bg-accent dark:hover:bg-[#403E43] dark:text-white dark:focus:bg-[#403E43] dark:focus:text-white"
        >
          <span className={`mr-2 ${language === 'en' ? 'font-bold' : ''}`}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage('es')}
          className="hover:bg-accent dark:hover:bg-[#403E43] dark:text-white dark:focus:bg-[#403E43] dark:focus:text-white"
        >
          <span className={`mr-2 ${language === 'es' ? 'font-bold' : ''}`}>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};