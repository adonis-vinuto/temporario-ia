import { BotMessageSquare, MessageCircleQuestion } from "lucide-react";

export enum AgentType {
  Standard,
  Assistant,
}

export const AgentTypeLabel = {
  [AgentType.Standard]: "Padrão",
  [AgentType.Assistant]: "Assistente",
};

export const AgentTypeIcon = {
  [AgentType.Standard]: BotMessageSquare,
  [AgentType.Assistant]: MessageCircleQuestion,
};
