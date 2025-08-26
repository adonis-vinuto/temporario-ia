import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // const isPublicPath = path === "/";

  const isAppPath =
    path.startsWith("/dashboard") ||
    path.startsWith("/agents") ||
    path.startsWith("/users");

  if (isAppPath) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
