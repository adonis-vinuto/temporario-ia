"use server";

import { Module } from "@/lib/enums/module";
import { AgentResponse } from "@/lib/interface/AgentResponse";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function buscarAgentePorId(
  module: Module,
  id: string
): Promise<AgentResponse> {
  const session = await getServerSession(authOptions);
 
    if (!session?.accessToken) {
      throw new Error("Token de autenticação não encontrado. Por favor, faça login novamente.");
    }
  const response = await fetch(
    `${process.env.API_URL}/api/${module}/agents/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 'x-functions-key': '<SUA_FUNCTION_KEY>' // remova se for authLevel: anonymous
        "Authorization": `Bearer ${session.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar agente com ID ${id}`);
  }

  const agente: AgentResponse = await response.json();
  return agente;
}
