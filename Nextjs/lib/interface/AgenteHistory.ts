import { SourceType } from "../enums/sourceType";

export interface AgenteHistory {
  id?: number;
  agent_id?: number;
  sent_at: Date; // Quando enviou
  message: string; // A mensagem do usuário
  response?: string; // A mensagem da IA
  source?: SourceType; // A fonte que foi
  sender?: string; // Usuário que enviou a mensagem
  display?: boolean; // Se vai aparecer ou não
  session?: string;
}
