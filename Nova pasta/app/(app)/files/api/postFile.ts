"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { FileData } from "@/lib/interface/FileData";

export async function postFile(
  data: {
    pdf: File;
  },
  module: Module
): Promise<FileData> {
  const formData = new FormData();
  formData.append("pdf", data.pdf);

  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/file`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao enviar arquivo: ${errorText}`);
  }

  const result: FileData = await response.json();
  return result;
}
