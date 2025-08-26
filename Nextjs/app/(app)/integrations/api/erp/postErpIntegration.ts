"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { SeniorErpIntegration } from "@/lib/interface/SeniorErpIntegration";

export async function postErpIntegration(
  data: {
    username: string;
    password: string;
    wsdlUrl: string;
  },
  module: Module
): Promise<SeniorErpIntegration> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-erp-config`,
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
    throw new Error(`Erro ao criar integração: ${errorText}`);
  }

  const result: SeniorErpIntegration = JSON.parse(await response.text());
  return result;
}
