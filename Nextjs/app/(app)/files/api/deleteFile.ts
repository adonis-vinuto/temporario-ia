"use server";

import { Module, ModuleNames } from "@/lib/enums/module";

export async function deleteFile(module: Module, idFile: string) {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/file/${idFile}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar arquivo");
  }
}
