"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { SeniorErpIntegration } from "@/lib/interface/SeniorErpIntegration";

export async function getErpIntegrations(
  module: Module
): Promise<SeniorErpIntegration[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-erp-config`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar integrações com Senior ERP");
  }

  const result: SeniorErpIntegration[] = await response.json();
  return result;
}
