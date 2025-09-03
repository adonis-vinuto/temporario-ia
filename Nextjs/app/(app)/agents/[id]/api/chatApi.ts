// app/(app)/agents/[id]/api/chatApi.ts

"use server";

import {
  ChatResponse,
  ChatFirstMessageResponse,
  ChatHistoryResponse,
  ChatSessionResponse,
  TwilioSession,
  ModuleType
} from "@/lib/interface/Chat";

const API_BASE_URL = process.env.API_URL || "";

/**
 * Envia a primeira mensagem para iniciar uma nova sessão de chat
 */
export async function sendFirstMessage(
  module: ModuleType,
  agentId: string,
  message: string
): Promise<ChatFirstMessageResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/${module}/chat/${agentId}/first-message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro ao enviar primeira mensagem");
  }

  const data = await response.json();
  return {
    messageResponse: data.messagResponse || data.messageResponse, // Handle typo in API
    sessionId: data.sessionId,
  };
}

/**
 * Envia uma mensagem em uma sessão existente
 */
export async function sendMessage(
  module: ModuleType,
  agentId: string,
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/${module}/chat/${agentId}/${sessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro ao enviar mensagem");
  }

  return response.json();
}

/**
 * Envia mensagem via integração Twilio
 */
export async function sendTwilioMessage(
  module: ModuleType,
  agentId: string,
  twilioData: string
): Promise<ChatResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/${module}/chat-twilio/${agentId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: twilioData,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro ao enviar mensagem Twilio");
  }

  return response.json();
}

/**
 * Busca todas as sessões de chat de um agente para um usuário
 */
export async function getChatSessions(
  module: ModuleType,
  agentId: string,
  userId: string
): Promise<ChatSessionResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/${module}/chat-session/${agentId}/${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro ao buscar sessões de chat");
  }

  const data = await response.json();
  return data.map((session: any) => ({
    sessionId: session.sessionId,
    lastSendDate: session.lastSendDate,
    totalInteractions: session.totalInteractions,
    userName: session.userName || `Usuário ${session.sessionId.slice(-4)}`, // Fallback para nome
  }));
}

/**
 * Busca todas as sessões Twilio de um agente
 */
export async function getTwilioSessions(
  module: ModuleType,
  agentId: string
): Promise<TwilioSession[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/${module}/chat-session-twilio/${agentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro ao buscar sessões Twilio");
  }

  const data = await response.json();
  // Filtrar valores null e mapear para o formato esperado
  return (data || [])
    .filter((session: any) => session !== null)
    .map((session: any) => ({
      phoneNumber: session.phoneNumber || session.From || "",
      sessionId: session.sessionId || session.MessageSid || "",
      lastSendDate: session.lastSendDate || new Date().toISOString(),
      totalInteractions: session.totalInteractions || 0,
      userName: session.ProfileName || session.userName || "Whatsapp User",
    }));
}

/**
 * Busca o histórico de mensagens de uma sessão
 */
export async function getChatHistory(
  module: ModuleType,
  sessionId: string
): Promise<ChatHistoryResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/${module}/chat-history/${sessionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(error.detail || "Erro ao buscar histórico de chat");
  }

  const data = await response.json();
  return data.map((message: any) => ({
    role: message.role,
    content: message.content,
    sendDate: message.sendDate,
    usage: {
      totalTokens: message.usage?.totalTokens || 0,
      totalTime: message.usage?.totalTime || 0,
    },
  }));
}

/**
 * Cria uma nova sessão de chat (útil para chat pessoal)
 */
export async function createChatSession(
  module: ModuleType,
  agentId: string,
  userId: string
): Promise<string> {
  // Esta função pode ser usada se você tiver um endpoint específico
  // para criar sessões sem enviar a primeira mensagem
  // Por enquanto, retorna um ID temporário
  return `session-${Date.now()}`;
}

/**
 * Deleta uma sessão de chat (se suportado pela API)
 */
export async function deleteChatSession(
  module: ModuleType,
  sessionId: string
): Promise<void> {
  // Implementar quando/se houver endpoint para deletar sessões
  console.log(`Deletando sessão: ${sessionId}`);
}

/**
 * Helper para formatar data/hora
 */
export function formatChatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (diffInHours < 168) { // 7 dias
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}