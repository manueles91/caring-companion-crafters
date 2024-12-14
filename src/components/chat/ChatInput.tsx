import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSend: () => void;
  isLoading: boolean;
}

const ChatInput = ({ input, setInput, handleSend, isLoading }: ChatInputProps) => {
  return (
    <div className="mt-4 flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe tu mensaje..."
        className="resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        className="px-8"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ChatInput;