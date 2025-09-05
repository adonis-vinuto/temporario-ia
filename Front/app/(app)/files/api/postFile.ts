"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { FileData } from "@/lib/interface/FileData";
import serverFetch from "../../../../lib/api/serverFetch";

export async function postFile(
  data: {
    pdf: File;
  },
  module: Module
): Promise<FileData> {
  const formData = new FormData();
  formData.append("arquivo", data.pdf);

  const response = await serverFetch(
    `/api/${ModuleNames[module]}/file`,
    "POST",
    formData,
    true
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar arquivo: ${errorText}`);
  }

  const result: FileData = await response.json();
  return result;
}
