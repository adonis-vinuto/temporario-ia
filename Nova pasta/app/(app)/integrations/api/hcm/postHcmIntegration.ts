"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { SeniorHcmIntegration } from "@/lib/interface/SeniorHcmIntegration";

export async function postHcmIntegration(
  data: {
    username: string;
    password: string;
    wsdlUrl: string;
  },
  module: Module
): Promise<SeniorHcmIntegration> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/senior-hcm-config`,
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

  const result: SeniorHcmIntegration = JSON.parse(await response.text());
  return result;
}
