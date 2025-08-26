import { AgentType } from "../enums/agentType";

export interface AgentResponse {
  id: number;
  name: string;
  description: string;
  type: AgentType;
}
