"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { Origin } from "@/lib/enums/origin";
import { AgentResponse } from "@/lib/interface/AgentResponse";

export async function updateAgente(
  id: number,
  name: string,
  module: Module,
  description: string,
  origin: Origin
): Promise<AgentResponse> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, name, description, origin }),
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao criar agente: ${erro}`);
  }

  return await response.json();
}
