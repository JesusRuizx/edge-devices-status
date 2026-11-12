import {
  COOKIE_USER_ACCESS,
  COOKIE_USER_EXPIRES_AT,
  COOKIE_USER_REFRESH,
} from "@/lib/slb/constants";
import { appUrl } from "@/lib/slb/app-origin";
import { hasUserSession, SIGN_IN_PATH } from "@/lib/slb/has-user-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function appendSessionCookieDeletes(response: NextResponse): void {
  response.cookies.delete(COOKIE_USER_ACCESS);
  response.cookies.delete(COOKIE_USER_REFRESH);
  response.cookies.delete(COOKIE_USER_EXPIRES_AT);
}

function hasAnySessionCookie(
  get: (name: string) => { value: string } | undefined,
): boolean {
  return Boolean(
    get(COOKIE_USER_ACCESS)?.value ||
      get(COOKIE_USER_REFRESH)?.value ||
      get(COOKIE_USER_EXPIRES_AT)?.value,
  );
}

export { SIGN_IN_PATH };

export function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/_next")) {
    return true;
  }
  if (pathname.startsWith("/authentication")) {
    return true;
  }
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/callback") ||
    pathname === "/api/auth/logout"
  ) {
    return true;
  }
  return false;
}

export function handleAuthGuard(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const session = hasUserSession((name) => request.cookies.get(name));

  if (pathname.startsWith("/authentication/sign-in") && session) {
    return NextResponse.redirect(appUrl(request, "/"));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { error: "unauthorized" },
        { status: 401 },
      );
      if (hasAnySessionCookie((name) => request.cookies.get(name))) {
        appendSessionCookieDeletes(response);
      }
      return response;
    }

    const signIn = appUrl(request, SIGN_IN_PATH);
    signIn.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(signIn);
    if (hasAnySessionCookie((name) => request.cookies.get(name))) {
      appendSessionCookieDeletes(response);
    }
    return response;
  }

  return NextResponse.next();
}
