import React from "react";
import { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.role === "user"
            ? "bg-primary text-primary-foreground ml-4"
            : "bg-muted"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;