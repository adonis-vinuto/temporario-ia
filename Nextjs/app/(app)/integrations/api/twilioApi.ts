"use server";

import { TwilioConfig, TwilioConfigRequest } from "@/lib/interface/TwilioConfig";
import { Module, ModuleNames } from "@/lib/enums/module";

const API_BASE_URL = process.env.API_URL || "";

export async function getTwilioConfigs(module: Module): Promise<TwilioConfig[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/twilio-config`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar configurações do Twilio");
  }

  return response.json();
}

export async function getTwilioConfigById(
  module: Module,
  configId: string
): Promise<TwilioConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/twilio-config/${configId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar configuração do Twilio");
  }

  return response.json();
}

export async function createTwilioConfig(
  module: Module,
  data: TwilioConfigRequest
): Promise<TwilioConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/twilio-config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar configuração do Twilio");
  }

  return response.json();
}

export async function updateTwilioConfig(
  module: Module,
  configId: string,
  data: TwilioConfigRequest
): Promise<TwilioConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/twilio-config/${configId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar configuração do Twilio");
  }

  return response.json();
}

export async function deleteTwilioConfig(
  module: Module,
  configId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/twilio-config/${configId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar configuração do Twilio");
  }
}