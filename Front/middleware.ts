import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_TOLERANCE = 5 * 1000; // 5 segundos de tolerância para evitar race conditions

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const path = req.nextUrl.pathname;
  const protectedPaths = ["/dashboard", "/agents", "/users"];
  const isProtectedPath = protectedPaths.some((p) => path.startsWith(p));

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("Middleware: Nenhum token encontrado.");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verificar apenas expiração da sessão JWT (não do accessToken)
  if (token.exp) {
    const sessionExp = Number(token.exp) * 1000; // converte para ms
    if (Date.now() > sessionExp - SESSION_TOLERANCE) {
      console.log("Middleware: Sessão expirada");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Não derrubamos a sessão mesmo que o accessToken esteja quase expirando
  console.log("Middleware OK, sessão ativa.");
  // console.log("token:: ", token)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
