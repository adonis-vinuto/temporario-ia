"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { TwilioIntegration } from "@/lib/interface/TwilioIntegration";

export async function updateTwilioIntegration(
  module: Module,
  agentId: string,
  data: {
    accountSid?: string;
    authToken?: string;
    webhookUrl?: string;
  }
): Promise<TwilioIntegration> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/twilio-config/${agentId}`,
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

  const result: TwilioIntegration = JSON.parse(await response.text());
  return result;
}