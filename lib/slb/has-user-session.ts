import { isAccessTokenExpired } from "@/lib/slb/access-token-expiry";
import {
  COOKIE_USER_ACCESS,
  COOKIE_USER_EXPIRES_AT,
  COOKIE_USER_REFRESH,
} from "@/lib/slb/constants";

type CookieGetter = (name: string) => { value: string } | undefined;

export function hasUserSession(get: CookieGetter): boolean {
  const access = get(COOKIE_USER_ACCESS)?.value;
  const refresh = get(COOKIE_USER_REFRESH)?.value;
  const expiresAt = get(COOKIE_USER_EXPIRES_AT)?.value;

  if (refresh) {
    return true;
  }

  if (access && !isAccessTokenExpired(access, expiresAt)) {
    return true;
  }

  return false;
}

export const SIGN_IN_PATH = "/authentication/sign-in";
