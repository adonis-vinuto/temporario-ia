"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { AgentData } from "@/lib/interface/Agent";

export async function listAgents(module: Module): Promise<AgentData[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/agent`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar agentes");
  }

  const agents: AgentData[] = await response.json();
  return agents;
}
