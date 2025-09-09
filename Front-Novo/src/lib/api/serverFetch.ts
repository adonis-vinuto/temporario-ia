import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function serverFetch(
  url: string,
  options?: {
    method?: string;
    body?: object;
    multipart?: boolean;
    params?: Record<string, string | string[]>;
  }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    throw new Error("Token de autenticação não encontrado");
  }
  
  const apiUrl = new URL(`${process.env.API_URL}${url}`);
  
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => apiUrl.searchParams.append(key, v));
      } else {
        apiUrl.searchParams.append(key, value);
      }
    });
  }
  
  const res = await fetch(apiUrl.toString(), {
    method: options?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      ...(options?.multipart ? {} : { "Content-Type": "application/json" }),
    },
    body: options?.multipart 
      ? (options.body as BodyInit) 
      : options?.body 
        ? JSON.stringify(options.body)
        : undefined,
  });
  
  return res;
}