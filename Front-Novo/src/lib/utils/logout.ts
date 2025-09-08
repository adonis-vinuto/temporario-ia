"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export default async function logout() {
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
        refresh_token: (await getServerSession(authOptions))?.refresh_token!,
      }),
    }
  );

  return res.ok;
}