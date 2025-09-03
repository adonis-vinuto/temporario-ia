"use server";

import { SeniorERPConfig, SeniorERPConfigRequest } from "@/lib/interface/SeniorERPConfig";
import { Module, ModuleNames } from "@/lib/enums/module";

const API_BASE_URL = process.env.API_URL || "";

export async function getSeniorERPConfigs(module: Module): Promise<SeniorERPConfig[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-erp-config`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar configurações do Senior ERP");
  }

  return response.json();
}

export async function getSeniorERPConfigById(
  module: Module,
  configId: string
): Promise<SeniorERPConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-erp-config/${configId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar configuração do Senior ERP");
  }

  return response.json();
}

export async function createSeniorERPConfig(
  module: Module,
  data: SeniorERPConfigRequest
): Promise<SeniorERPConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-erp-config`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar configuração do Senior ERP");
  }

  return response.json();
}

export async function updateSeniorERPConfig(
  module: Module,
  configId: string,
  data: SeniorERPConfigRequest
): Promise<SeniorERPConfig> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-erp-config/${configId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar configuração do Senior ERP");
  }

  return response.json();
}

export async function deleteSeniorERPConfig(
  module: Module,
  configId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/${ModuleNames[module]}/senior-erp-config/${configId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar configuração do Senior ERP");
  }
}