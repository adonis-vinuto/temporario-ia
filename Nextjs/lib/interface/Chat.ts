// lib/interface/Chat.ts

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  messageResponse: string;
}

export interface ChatFirstMessageResponse {
  messageResponse: string;
  sessionId: string;
}

export interface ChatHistoryResponse {
  role: 0 | 1; // 0 = assistant, 1 = user
  content: string;
  sendDate: string;
  usage: {
    totalTokens: number;
    totalTime: number;
  };
}

export interface ChatSessionResponse {
  sessionId: string;
  lastSendDate: string;
  totalInteractions: number;
  userName?: string; // Adicionado para facilitar a exibição
}

export interface TwilioSession {
  phoneNumber: string;
  sessionId: string;
  lastSendDate: string;
  totalInteractions: number;
  userName?: string;
}

export interface BaseResponseError {
  title: string;
  status: number;
  detail: string;
}

export interface ValidationResponseError {
  title: string;
  status: number;
  errors: {
    [key: string]: string[];
  };
}

export type ModuleType = 'people' | 'sales' | 'finance';