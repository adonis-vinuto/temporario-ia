"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { SeniorErpIntegration } from "@/lib/interface/SeniorErpIntegration";

export async function updateErpIntegration(
  module: Module,
  configId: string,
  data: {
    username?: string;
    password?: string;
    wsdlUrl?: string;
  }
): Promise<SeniorErpIntegration> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-erp-config/${configId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao atualizar integração: ${errorText}`);
  }

  const result: SeniorErpIntegration = JSON.parse(await response.text());
  return result;
}