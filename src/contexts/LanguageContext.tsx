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
    "features.knowledge.title": "Knowledge Base",
    "features.knowledge.description": "Upload files and images to enhance your assistant's knowledge and capabilities",
    "features.memory.title": "Continuous Learning",
    "features.memory.description": "Your assistant remembers and learns from every conversation to provide better responses",
    "features.customization.title": "Custom Actions",
    "features.customization.description": "Define specific actions and capabilities for your assistant to perform",
    "features.personality.title": "Personality Traits",
    "features.personality.description": "Shape your assistant's behavior and communication style to match your preferences",
    "features.analytics.title": "Performance Insights",
    "features.analytics.description": "Track and analyze your assistant's interactions and effectiveness",
    "auth.welcome": "Welcome",
    "auth.subtitle": "Create an account or sign in to continue",
    "auth.error.title": "Authentication Error",
    "auth.error.invalidCredentials": "Invalid email or password. Please try again.",
    "auth.wantMore": "Want to do more?",
    "auth.signUpTo": "Sign up to",
    "auth.features.createAgents": "Create your own AI assistants with custom personalities",
    "auth.features.addFiles": "Add files and custom instructions to enhance their knowledge",
    "auth.features.enableMemory": "Enable long-term memory for continuous learning"
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
    "features.knowledge.title": "Base de Conocimiento",
    "features.knowledge.description": "Sube archivos e imágenes para mejorar el conocimiento y las capacidades de tu asistente",
    "features.memory.title": "Aprendizaje Continuo",
    "features.memory.description": "Tu asistente recuerda y aprende de cada conversación para proporcionar mejores respuestas",
    "features.customization.title": "Acciones Personalizadas",
    "features.customization.description": "Define acciones y capacidades específicas para que tu asistente las realice",
    "features.personality.title": "Rasgos de Personalidad",
    "features.personality.description": "Moldea el comportamiento y estilo de comunicación de tu asistente según tus preferencias",
    "features.analytics.title": "Análisis de Rendimiento",
    "features.analytics.description": "Rastrea y analiza las interacciones y efectividad de tu asistente",
    "auth.welcome": "Bienvenido",
    "auth.subtitle": "Crea una cuenta o inicia sesión para continuar",
    "auth.error.title": "Error de Autenticación",
    "auth.error.invalidCredentials": "Email o contraseña inválidos. Por favor, intenta de nuevo.",
    "auth.wantMore": "¿Quieres hacer más?",
    "auth.signUpTo": "Regístrate para",
    "auth.features.createAgents": "Crea tus propios asistentes IA con personalidades personalizadas",
    "auth.features.addFiles": "Añade archivos e instrucciones personalizadas para mejorar su conocimiento",
    "auth.features.enableMemory": "Habilita la memoria a largo plazo para un aprendizaje continuo"
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
