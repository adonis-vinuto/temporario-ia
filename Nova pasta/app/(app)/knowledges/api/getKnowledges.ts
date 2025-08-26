"use server";

import { Module, ModuleNames } from "@/lib/enums/module";
import { Knowledge } from "@/lib/interface/Knowledge";

export async function getKnowledges(module: Module): Promise<Knowledge[]> {
  const response = await fetch(
    `${process.env.API_URL}/api/${ModuleNames[module]}/knowledge`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar conhecimentos");
  }

  const result: Knowledge[] = await response.json();
  return result;
}
