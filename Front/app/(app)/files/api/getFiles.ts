"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { FileData } from "@/lib/interface/FileData";
import serverFetch from "../../../../lib/api/serverFetch";
import { Paginated } from "../../../../lib/interface/Paginated";

export async function getFiles(
  module: Module,
  pagina: number = 1,
  tamanhoPagina: number = 10
): Promise<Paginated<FileData>> {
  const response = await serverFetch(
    `/api/${ModuleNames[module]}/file`,
    "GET",
    undefined,
    undefined,
    {
      pagina: pagina.toString(),
      tamanhoPagina: tamanhoPagina.toString(),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar arquivos");
  }

  const result: Paginated<FileData> = await response.json();
  return result;
}
