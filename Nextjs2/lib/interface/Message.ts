import { RoleChat } from "../enums/roleChat";

export interface Message {
  content: string;
  sender: RoleChat;
}
