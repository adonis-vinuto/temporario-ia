"use server";

import { Module, ModuleNames } from "@/lib/enums/module";

export async function deleteTwilioIntegration(
  module: Module,
  agentId: string
): Promise<void> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/twilio-config/${agentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao excluir integração: ${errorText}`);
  }
}