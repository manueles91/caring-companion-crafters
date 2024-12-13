export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  instructions: string | null;
  traits: string[] | null;
}