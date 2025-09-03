"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import serverFetch from "../../../../lib/api/serverFetch";

export async function deleteFile(module: Module, idFile: string) {
  const response = await serverFetch(
    `/api/${ModuleNames[module]}/file/${idFile}`,
    "DELETE"
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar arquivo");
  }
}
