"use client";

import { getSession } from "next-auth/react";

export default async function clientFetch(
  url: string,
  method?: string,
  body?: object
) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method: method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${(await getSession())?.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(
      `Erro ao buscar dados: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}

export async function clientFetchMultipart(
  url: string,
  method?: string,
  body?: BodyInit
) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      method: method ?? "GET",
      headers: {
        Authorization: `Bearer ${(await getSession())?.accessToken}`,
      },
      body: body,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error(
      `Erro ao buscar dados: ${
        error instanceof Error ? error.message : "Erro desconhecido"
      }`
    );
  }
}
