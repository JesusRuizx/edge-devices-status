import { getSlbTokenEnv } from "./env";

export type TokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

function authHeaderBasic(clientId: string, clientSecret: string): string {
  const raw = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(raw, "utf8").toString("base64")}`;
}

async function postToken(
  body: URLSearchParams,
  mode: "body" | "basic",
  clientId: string,
  clientSecret: string,
): Promise<TokenResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (mode === "basic") {
    headers.Authorization = authHeaderBasic(clientId, clientSecret);
  } else {
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
  }

  const { tokenUrl } = getSlbTokenEnv();
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers,
    body: body.toString(),
    cache: "no-store",
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Token endpoint returned non-JSON (${res.status}): ${text.slice(0, 500)}`,
    );
  }

  if (!res.ok) {
    const err = json as { error?: string; error_description?: string };
    throw new Error(
      `Token request failed (${res.status}): ${err.error ?? "unknown"} ${err.error_description ?? text}`,
    );
  }

  return json as TokenResponse;
}

export async function exchangeAuthorizationCode(params: {
  code: string;
  redirectUri: string;
  codeVerifier?: string;
}): Promise<TokenResponse> {
  const { clientId, clientSecret, tokenClientAuth } = getSlbTokenEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  });
  if (params.codeVerifier) {
    body.set("code_verifier", params.codeVerifier);
  }
  return postToken(body, tokenClientAuth, clientId, clientSecret);
}

export async function refreshUserToken(
  refreshToken: string,
): Promise<TokenResponse> {
  const { clientId, clientSecret, tokenClientAuth } = getSlbTokenEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  return postToken(body, tokenClientAuth, clientId, clientSecret);
}
