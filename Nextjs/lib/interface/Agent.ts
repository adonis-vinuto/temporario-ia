import { AgentType } from "../enums/agentType";
import { Module } from "../enums/module";

export interface AgentData {
  id?: string;
  name: string;
  description: string;
  agent_type: AgentType;
  module: Module;
}
