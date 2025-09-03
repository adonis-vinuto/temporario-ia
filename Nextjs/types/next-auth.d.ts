export declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

export declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expires?: number;
    error?: string;
    user?: DefaultSession["user"];
  }
}