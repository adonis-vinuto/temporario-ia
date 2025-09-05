import { FileStatus } from "../enums/fileStatus";

export interface FileData {
  id: string;
  fileName: string;
  pages?: Page[];
  resumepdf?: string;
  status: FileStatus;
  urlFile: string;
  usage?: Usage;
}

export interface Page {
  content: string;
  page: number;
  resumePage: string;
  title: string;
}

export interface Usage {
  totalOracleInteractions: number;
  totalTime: number;
  totalTokens: number;
}
