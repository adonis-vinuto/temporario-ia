"use server";

import { AgentResponse } from "@/lib/interface/AgentResponse";
import { AgentType } from "../../../../lib/enums/agentType";
import { Module, ModuleNames } from "@/lib/enums/module";

export async function criarAgenteIA(data: {
  module: Module;
  name: string;
  description: string;
  type: AgentType;
}): Promise<AgentResponse> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[data.module]}/agent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar agente: ${errorText}`);
  }

  const result: AgentResponse = JSON.parse(await response.text());
  return result;
}
