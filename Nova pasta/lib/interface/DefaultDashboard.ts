import { AgentType } from "../enums/agentType";

export interface DefaultDashboard {
  total_agents: number;
  total_interactions: number;
  interactions_by_agent_type: InteractionByAgentType[];
}

export interface InteractionByAgentType {
  agent_type: AgentType;
  interactions_count: number;
}

export interface EmployeesByCity {
  city: string;
  count: number;
}
