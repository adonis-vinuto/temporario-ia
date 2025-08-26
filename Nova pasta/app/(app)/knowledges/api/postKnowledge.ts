"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { Knowledge } from "@/lib/interface/Knowledge";

export async function postKnowledge(
  data: {
    description?: string;
    name: string;
    origin: number;
  },
  module: Module
): Promise<Knowledge> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/knowledge`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar conhecimento: ${errorText}`);
  }

  const result: Knowledge = JSON.parse(await response.text());
  return result;
}
