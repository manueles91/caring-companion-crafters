export const validateAgentForm = (name: string, description: string) => {
  if (!name.trim() || !description.trim()) {
    return "Por favor completa los campos requeridos";
  }
  return null;
};