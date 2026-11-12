import "server-only";

import { isAccessTokenExpired } from "@/lib/slb/access-token-expiry";
import { refreshUserToken } from "@/lib/slb/token-client";
import { cookies } from "next/headers";
import {
  COOKIE_USER_ACCESS,
  COOKIE_USER_EXPIRES_AT,
  COOKIE_USER_REFRESH,
} from "./constants";

function cookieBaseOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure,
    path: "/",
  };
}

export async function setUserSessionFromTokenResponse(tr: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}): Promise<void> {
  const jar = await cookies();
  const base = cookieBaseOptions();
  const maxAgeAccess = tr.expires_in ?? 3600;

  jar.set(COOKIE_USER_ACCESS, tr.access_token, {
    ...base,
    maxAge: maxAgeAccess,
  });

  if (tr.refresh_token) {
    jar.set(COOKIE_USER_REFRESH, tr.refresh_token, {
      ...base,
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  const exp = Math.floor(Date.now() / 1000) + (tr.expires_in ?? maxAgeAccess);
  jar.set(COOKIE_USER_EXPIRES_AT, String(exp), {
    ...base,
    maxAge: maxAgeAccess,
  });
}

export async function clearUserSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_USER_ACCESS);
  jar.delete(COOKIE_USER_REFRESH);
  jar.delete(COOKIE_USER_EXPIRES_AT);
}
