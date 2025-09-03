import { RoleChat } from "../enums/roleChat";

export interface ChatHistory {
  role: RoleChat;
  content: string;
  sendDate: Date;
  usage: {
    totalTokens: number;
    totalTime: number;
  };
}
