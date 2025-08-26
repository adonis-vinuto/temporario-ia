export interface AgenteTwilio {
  agent_id: number;
  phone_number?: string; // Número do telefone
  account_sid?: string; // Token da conta em si
  auth_token?: string; // Token do Twilio (Serviço)
  webhook?: string; // String gerada pelo sistema
}
