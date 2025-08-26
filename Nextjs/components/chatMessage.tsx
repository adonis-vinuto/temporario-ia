import { RoleChat } from "@/lib/enums/roleChat";
import { Message } from "@/lib/interface/Message";
import { Avatar } from "./ui/avatar";
import { BotIcon, User } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: Readonly<ChatMessageProps>) {
  const isUser = message.sender === RoleChat.User;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start gap-3 max-w-[60%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
              <User size={16} />
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground">
              <BotIcon size={16} />
            </Avatar>
          )}
        </div>
        <div
          className={`flex-1 min-w-0 rounded-lg p-3 shadow-sm whitespace-pre-wrap break-words ${
            isUser
              ? "bg-message-user text-primary-foreground"
              : "bg-message-agent text-secondary-foreground"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
