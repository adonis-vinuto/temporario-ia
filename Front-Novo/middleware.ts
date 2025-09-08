import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_TOLERANCE = 5 * 1000;

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

  if (token.exp) {
    const sessionExp = Number(token.exp) * 1000; // converte para ms
    if (Date.now() > sessionExp - SESSION_TOLERANCE) {
      console.log("Middleware: Sessão expirada");
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  console.log("Middleware OK, sessão ativa.");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
