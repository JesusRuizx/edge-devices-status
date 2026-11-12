import { decodeJwtPayload } from "@/lib/slb/jwt-profile";

export const ACCESS_TOKEN_EXPIRY_SKEW_SEC = 30;

export function isAccessTokenExpired(
  access: string,
  expiresAtCookie: string | undefined,
): boolean {
  const now = Math.floor(Date.now() / 1000);

  if (expiresAtCookie) {
    const exp = Number(expiresAtCookie);
    if (Number.isFinite(exp) && now >= exp - ACCESS_TOKEN_EXPIRY_SKEW_SEC) {
      return true;
    }
  }

  const claims = decodeJwtPayload(access);
  if (
    claims &&
    typeof claims.exp === "number" &&
    now >= claims.exp - ACCESS_TOKEN_EXPIRY_SKEW_SEC
  ) {
    return true;
  }

  return false;
}
