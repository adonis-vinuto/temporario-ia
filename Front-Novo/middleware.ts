import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Usa o middleware do NextAuth para verificação robusta
export default withAuth(
  function middleware(req) {
    console.log("[Middleware] Token:", req.nextauth.token ? "Válido" : "Inválido");
    console.log("[Middleware] Path:", req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      // Só autoriza se tiver token válido
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Log para debug
        console.log("[Middleware Auth Check]", {
          path,
          hasToken: !!token,
          tokenExp: token?.exp ? new Date(Number(token.exp) * 1000).toISOString() : null,
        });
        
        // Se não tem token, não autoriza
        if (!token) {
          console.log("[Middleware] Sem token, bloqueando acesso");
          return false;
        }
        
        // Verifica se o token está expirado
        if (token.exp && Date.now() >= Number(token.exp) * 1000) {
          console.log("[Middleware] Token expirado, bloqueando acesso");
          return false;
        }
        
        // Token válido
        return true;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

// Configuração de quais rotas o middleware deve proteger
export const config = {
  matcher: [
    // Protege todas as rotas dentro de (app)
    "/dashboard/:path*",
    "/agents/:path*",
    "/users/:path*",
    "/files/:path*",
    "/knowledges/:path*",
    "/integrations/:path*",
    "/settings/:path*",
  ],
};