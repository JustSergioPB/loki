import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";
import { decrypt } from "./lib/helpers/session";

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/users", "/orgs", "/onboarding", "/inactive"];

const publicRoutes = [
  "/login",
  "/signup",
  "/confirm-account",
  "/forgot-password",
  "/reset-password",
  "/hall",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isProtectedRoute && session?.userId && session?.redirect) {
    return NextResponse.redirect(
      new URL(session?.redirect as string, req.nextUrl)
    );
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
