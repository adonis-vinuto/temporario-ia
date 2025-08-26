import { Module } from "../enums/module";

export interface DataConfig {
  idDataConfig: string;
  blobAzureDataConfig: BlobAzureDataConfig;
  chromaDataConfig: ChromaDataConfig;
  idOrganization: string;
  module: Module;
  sqlDataConfig: SqlDataConfig;
}

export interface BlobAzureDataConfig {
  blobContainerName: string;
  connectionString: string;
}

export interface ChromaDataConfig {
  isEnabled: boolean;
  path: string;
}

export interface SqlDataConfig {
  connectionType: number;
  db: string;
  host: string;
  password: string;
  port: string;
  user: string;
}
