export interface DefaultDashboard {
  "total-agents": number;
  "total-interactions": number;
  "interactions-by-agent-type": InteractionByAgentType[];
}

export interface InteractionByAgentType {
  "agent-type": number;
  "interactions-count": number;
}

export interface EmployeesByCity {
  city: string;
  count: number;
}