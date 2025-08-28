"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { SeniorHcmIntegration } from "@/lib/interface/SeniorHcmIntegration";

export async function updateHcmIntegration(
  module: Module,
  configId: string,
  data: {
    username?: string;
    password?: string;
    wsdlUrl?: string;
  }
): Promise<SeniorHcmIntegration> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-hcm-config/${configId}`,
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

  const result: SeniorHcmIntegration = JSON.parse(await response.text());
  return result;
}