"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { ChatSession } from "@/lib/interface/ChatSession";

export async function getChatSession(
  module: Module,
  agentId: string
): Promise<ChatSession[]> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/${ModuleNames[module]}/chat-session/${agentId}/id-1`,
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
