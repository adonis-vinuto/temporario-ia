import { AgentType } from "../enums/agentType";

export interface AgenteRh {
  id: number;
  name?: string;
  description?: string;
  agent_type?: AgentType;
}
