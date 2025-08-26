"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { TwilioIntegration } from "@/lib/interface/TwilioIntegration";

export async function getTwilioIntegrations(
  module: Module,
  idAgent: string
): Promise<TwilioIntegration[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/twilio-config/${idAgent}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar integrações com Twilio");
  }

  const result: TwilioIntegration[] = await response.json();
  return result;
}
