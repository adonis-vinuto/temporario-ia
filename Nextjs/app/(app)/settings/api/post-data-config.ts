"use server";

import { Module } from "@/lib/enums/module";
import {
  BlobAzureDataConfig,
  ChromaDataConfig,
  DataConfig,
  SqlDataConfig,
} from "@/lib/interface/DataConfig";

export async function postDataConfig(data: {
  blobAzureDataConfig: BlobAzureDataConfig;
  chromaDataConfig: ChromaDataConfig;
  idOrganization: string;
  module: Module;
  sqlDataConfig: SqlDataConfig;
}): Promise<DataConfig> {
  const response = await fetch(`${process.env.API_URL}/api/data-config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar data config: ${errorText}`);
  }

  const result: DataConfig = await response.json();
  return result;
}
