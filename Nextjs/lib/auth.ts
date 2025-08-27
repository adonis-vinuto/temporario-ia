import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

// Interfaces para tipagem
interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expires?: number;
  error?: string;
}

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });
    
    const data: RefreshTokenResponse = await response.json();

    if (!response.ok) throw data;

    return {
      ...token,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? token.refreshToken,
      expires: Date.now() + data.expires_in * 1000,
    };
  } catch (error) {
    console.error("Erro ao renovar access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}`,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, account }) {
      const extendedToken = token as ExtendedToken;
      
      if (account) {
        extendedToken.accessToken = account.access_token;
        extendedToken.refreshToken = account.refresh_token;
        extendedToken.expires = account.expires_at! * 1000;
      }
      
      if (extendedToken.expires && Date.now() < extendedToken.expires) {
        return extendedToken;
      }
      
      return extendedToken.refreshToken ? refreshAccessToken(extendedToken) : extendedToken;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;
      const extendedSession = session as typeof session & {
        accessToken?: string;
        error?: string;
      };
      
      extendedSession.accessToken = extendedToken.accessToken;
      extendedSession.error = extendedToken.error;
      return extendedSession;
    },
  },
};