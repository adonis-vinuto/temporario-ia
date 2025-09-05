"use server";

import { SeniorHCMConfig, SeniorHCMConfigRequest } from "@/lib/interface/SeniorHCMConfig";
import { Module, ModuleNames } from "@/lib/enums/module";

const API_BASE_URL = process.env.API_URL || "";

export async function getSeniorHCMConfigs(module: Module): Promise<SeniorHCMConfig[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-hcm-config`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar configurações do Senior HCM");
  }

  return response.json();
}

export async function getSeniorHCMConfigById(
  module: Module,
  configId: string
): Promise<SeniorHCMConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-hcm-config/${configId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar configuração do Senior HCM");
  }

  return response.json();
}

export async function createSeniorHCMConfig(
  module: Module,
  data: SeniorHCMConfigRequest
): Promise<SeniorHCMConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-hcm-config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar configuração do Senior HCM");
  }

  return response.json();
}

export async function updateSeniorHCMConfig(
  module: Module,
  configId: string,
  data: SeniorHCMConfigRequest
): Promise<SeniorHCMConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-hcm-config/${configId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar configuração do Senior HCM");
  }

  return response.json();
}

export async function deleteSeniorHCMConfig(
  module: Module,
  configId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-hcm-config/${configId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar configuração do Senior HCM");
  }
}