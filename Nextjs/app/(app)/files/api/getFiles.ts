"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { FileData } from "@/lib/interface/FileData";

export async function getFiles(module: Module): Promise<FileData[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/file`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar arquivos");
  }

  const result: FileData[] = await response.json();
  return result;
}
