import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const publicPaths = ["/login", "/register", "/verify-otp", "/campus-bg.jpg"];
  const isPublicPath = publicPaths.includes(pathname);
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  // If user is logged in and tries to access login/register, redirect to /root
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }
  

  // If user is not logged in and tries to access a private route, redirect to /login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|auth).*)"],
};

