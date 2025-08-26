"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { SeniorHcmIntegration } from "@/lib/interface/SeniorHcmIntegration";

export async function getHcmIntegrations(
  module: Module
): Promise<SeniorHcmIntegration[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-hcm-config`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar integrações com Senior HCM");
  }

  const result: SeniorHcmIntegration[] = await response.json();
  return result;
}
