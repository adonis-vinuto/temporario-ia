"use server";

import { Module, ModuleNames } from "@/lib/enums/module";

export async function postFirstMessage(
  module: Module,
  idAgent: string,
  message: string
) {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/${ModuleNames[module]}/chat/${idAgent}/first-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }
    );

    const data = await response.json();

    return {
      status: response.status,
      detail: data?.detail || "Erro desconhecido",
      ...data,
    };
  } catch {
    return {
      status: 500,
      detail: "Erro de conexão com o servidor",
    };
  }
}
