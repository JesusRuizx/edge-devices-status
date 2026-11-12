import { formatErrorForAuthRedirect } from "@/lib/format-node-error";
import { getAppOrigin } from "@/lib/slb/app-origin";
import { COOKIE_OAUTH_STATE, COOKIE_PKCE_VERIFIER } from "@/lib/slb/constants";
import { getSlbUserOAuthEnv } from "@/lib/slb/env";
import { setUserSessionFromTokenResponse } from "@/lib/slb/session-cookies";
import { exchangeAuthorizationCode } from "@/lib/slb/token-client";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * OAuth redirect callback. Register this exact URL in the SLB portal:
 * http://localhost:3000/api/callback
 */
export async function GET(request: NextRequest) {
  const origin = getAppOrigin(request);
  const fail = (code: string) =>
    NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(code)}`, origin),
    );

  const url = request.nextUrl;
  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    const desc = url.searchParams.get("error_description") ?? "";
    return fail(`${oauthError}${desc ? `: ${desc}` : ""}`);
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return fail("missing_code_or_state");
  }

  const jar = await cookies();
  const expectedState = jar.get(COOKIE_OAUTH_STATE)?.value;
  if (!expectedState || expectedState !== state) {
    return fail("invalid_state");
  }

  const env = getSlbUserOAuthEnv();
  const pkceVerifier = env.usePkce
    ? jar.get(COOKIE_PKCE_VERIFIER)?.value
    : undefined;
  if (env.usePkce && !pkceVerifier) {
    return fail("missing_pkce_verifier");
  }

  jar.delete(COOKIE_OAUTH_STATE);
  jar.delete(COOKIE_PKCE_VERIFIER);

  try {
    const tokens = await exchangeAuthorizationCode({
      code,
      redirectUri: env.redirectUri,
      codeVerifier: pkceVerifier,
    });
    await setUserSessionFromTokenResponse(tokens);
  } catch (e) {
    const message = formatErrorForAuthRedirect(e);
    return fail(message);
  }

  return NextResponse.redirect(new URL("/", origin));
}
