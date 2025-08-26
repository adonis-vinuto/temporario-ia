"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { ChatHistory } from "@/lib/interface/ChatHistory";

export async function getChatHistory(
  module: Module,
  sessionId: string
): Promise<ChatHistory[]> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/${ModuleNames[module]}/chat-history/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching chat history: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return [];
  }
}
