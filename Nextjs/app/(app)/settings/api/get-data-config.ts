"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { DataConfig } from "@/lib/interface/DataConfig";

export async function getDataConfigById(
  module: Module,
  idDataConfig: string
): Promise<DataConfig[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/data-config/${idDataConfig}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar data config");
  }

  const result: DataConfig[] = await response.json();
  return result;
}
