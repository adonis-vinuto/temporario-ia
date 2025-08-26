"use server";

import { SendChatRequest } from "@/lib/interface/SendChatRequest";
import { SendChatResponse } from "@/lib/interface/SendChatResponse";

export async function sendChat(
  idAgent: number,
  sendChat: SendChatRequest
): Promise<SendChatResponse> {
  const response = await fetch(`${process.env.API_URL}/sendChat/${idAgent}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendChat),
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao enviar mensagem: ${erro}`);
  }

  return await response.json();
}
