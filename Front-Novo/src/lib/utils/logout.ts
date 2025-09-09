"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export default async function logout(): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.refresh_token) {
      return false;
    }
    
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
    
    return res.ok;
  } catch {
    return false;
  }
}