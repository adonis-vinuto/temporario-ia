"use server";

import { Module } from "@/lib/enums/module";
import {
  BlobAzureDataConfig,
  ChromaDataConfig,
  DataConfig,
  SqlDataConfig,
} from "@/lib/interface/DataConfig";

export async function putDataConfig(
  data: {
    blobAzureDataConfig: BlobAzureDataConfig;
    chromaDataConfig: ChromaDataConfig;
    idOrganization: string;
    module: Module;
    sqlDataConfig: SqlDataConfig;
  },
  idDataConfig: string
): Promise<DataConfig> {
  const response = await fetch(
    `${process.env.API_URL}/api/data-config/${idDataConfig}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao editar data config: ${errorText}`);
  }

  const result: DataConfig = await response.json();
  return result;
}
