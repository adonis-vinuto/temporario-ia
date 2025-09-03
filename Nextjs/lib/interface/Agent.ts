// lib/interface/Agent.ts
import { AgentType } from "../enums/agentType";
import { Module } from "../enums/module";

export interface AgentData {
  id?: string;
  organization?: string;
  name: string;
  description: string;
  typeAgent: AgentType; // Mudou de agent_type para typeAgent
  module: Module;
}

// Nova interface para a resposta paginada
export interface PaginatedAgentsResponse {
  totalPaginas: number;
  totalItens: number;
  indice: number;
  tamanhoPagina: number;
  itens: AgentData[][]; // Array de arrays de AgentData
}