"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { TwilioIntegration } from "@/lib/interface/TwilioIntegration";

export async function postTwilioIntegration(
  data: {
    accountSid: string;
    authToken: string;
    webhookUrl: string;
  },
  idAgent: string,
  module: Module
): Promise<TwilioIntegration> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/twilio-config/${idAgent}`,
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

  const result: TwilioIntegration = JSON.parse(await response.text());
  return result;
}
