export declare module "next-auth" {
  interface Session {
    refresh_token?: string;
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
  }
}
