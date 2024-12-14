import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'es';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    "nav.title": "My Assistants",
    "nav.signOut": "Sign out",
    "nav.createAgent": "Create Agent",
    "nav.back": "Back",
    "agents.title": "AI Agents",
    "agents.subtitle.creator": "Create and manage your AI assistants",
    "agents.subtitle.user": "Chat with AI assistants",
    "agents.newAgent": "New Agent",
    "agents.noAgents": "No agents",
    "agents.noAgents.creator": "Create your first AI agent to get started",
    "agents.noAgents.user": "No agents available at this time",
  },
  es: {
    "nav.title": "Mis Asistentes",
    "nav.signOut": "Cerrar sesión",
    "nav.createAgent": "Crear Agente",
    "nav.back": "Volver",
    "agents.title": "Agentes IA",
    "agents.subtitle.creator": "Crea y gestiona tus asistentes IA",
    "agents.subtitle.user": "Chatea con asistentes IA",
    "agents.newAgent": "Nuevo Agente",
    "agents.noAgents": "No hay agentes",
    "agents.noAgents.creator": "Crea tu primer agente IA para comenzar",
    "agents.noAgents.user": "No hay agentes disponibles en este momento",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};