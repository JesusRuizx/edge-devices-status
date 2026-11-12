import { COOKIE_OAUTH_STATE, COOKIE_PKCE_VERIFIER } from "@/lib/slb/constants";
import { getSlbUserOAuthEnv } from "@/lib/slb/env";
import { generatePkcePair, randomState } from "@/lib/slb/pkce";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function transientCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 600,
  };
}

/**
 * Starts the user-delegated OAuth flow (authorization code).
 * Redirect URI must be registered as e.g. http://localhost:3000/api/callback
 */
export async function GET() {
  const env = getSlbUserOAuthEnv();
  const state = randomState();
  const jar = await cookies();

  jar.set(COOKIE_OAUTH_STATE, state, transientCookieOptions());

  const authorize = new URL(env.authorizationUrl);
  authorize.searchParams.set("client_id", env.clientId);
  authorize.searchParams.set("redirect_uri", env.redirectUri);
  authorize.searchParams.set("response_type", "code");
  if (env.userScopes) {
    authorize.searchParams.set("scope", env.userScopes);
  }
  authorize.searchParams.set("state", state);

  if (env.usePkce) {
    const { verifier, challenge } = generatePkcePair();
    jar.set(COOKIE_PKCE_VERIFIER, verifier, transientCookieOptions());
    authorize.searchParams.set("code_challenge", challenge);
    authorize.searchParams.set("code_challenge_method", "S256");
  }

  return NextResponse.redirect(authorize);
}
