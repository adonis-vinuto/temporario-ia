"use server";

import { Module, ModuleNames } from "@/lib/enums/module";

export async function deleteHcmIntegration(
  module: Module,
  configId: string
): Promise<void> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-hcm-config/${configId}`,
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