import { FileType } from "../enums/fileType";

export interface AgenteFiles {
  id?: number;
  agent_id?: number;
  resume?: string;
  pdf_type?: FileType;
}
