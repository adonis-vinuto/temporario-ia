export interface SendChatResponse {
  id: number;
  agent_id: number;
  sent_at: Date;
  message: string;
  response: string;
  source: number;
  sender: string;
  display: boolean;
  session: string;
}
