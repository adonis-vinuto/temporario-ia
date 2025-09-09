"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export default async function logout(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    // Tenta fazer logout no Keycloak se tiver refresh_token
    if (session?.refresh_token) {
      try {
        const res = await fetch(
          `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: process.env.KEYCLOAK_CLIENT_ID!,
              client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
              refresh_token: session.refresh_token,
            }),
          }
        );
        
        console.log("Logout Keycloak status:", res.ok);
      } catch (error) {
        console.error("Erro ao fazer logout no Keycloak:", error);
      }
    }
    
    // Limpa cookies do NextAuth manualmente
    const cookieStore = await cookies();
    
    // Lista todos os possíveis cookies do NextAuth
    const authCookies = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "next-auth.csrf-token", 
      "__Secure-next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.callback-url",
    ];
    
    // Remove cada cookie com diferentes configurações
    authCookies.forEach(cookieName => {
      // Tenta deletar com diferentes paths
      cookieStore.delete({
        name: cookieName,
        path: "/",
      });
    });
    
    // Invalida o cache das páginas
    revalidatePath("/", "layout");
    
    return true;
  } catch (error) {
    console.error("Erro no logout:", error);
    return false;
  }
}