"use server";

import { Module } from "@/lib/enums/module";
import { AgentResponse } from "@/lib/interface/AgentResponse";

export async function buscarAgentePorId(
  module: Module,
  id: string
): Promise<AgentResponse> {
  const response = await fetch(
    `${process.env.API_URL}/api/${module}/agent/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'x-functions-key': '<SUA_FUNCTION_KEY>' // remova se for authLevel: anonymous
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar agente com ID ${id}`);
  }

  const agente: AgentResponse = await response.json();
  return agente;
}
