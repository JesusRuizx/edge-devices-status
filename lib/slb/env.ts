/** Strips matching outer quotes so .env lines like KEY='a b' work as intended. */
function normalizeEnvValue(v: string): string {
  const s = v.trim();
  if (
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2) ||
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2)
  ) {
    return s.slice(1, -1).trim();
  }
  return s;
}

function required(name: string): string {
  const v = process.env[name];
  if (!v?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return normalizeEnvValue(v);
}

function optional(name: string): string | undefined {
  const v = process.env[name]?.trim();
  if (!v) return undefined;
  const n = normalizeEnvValue(v);
  return n || undefined;
}

export function getSlbTokenEnv() {
  return {
    clientId: required("APP_CLIENT_ID"),
    clientSecret: required("APP_CLIENT_SECRET"),
    appKey: optional("APP_KEY"),
    tokenUrl: required("SLB_TOKEN_URL"),
    userScopes: optional("SLB_SCOPES") ?? optional("SLB_AUDIENCE") ?? "",
    appScopes: optional("SLB_APP_SCOPES"),
    tokenClientAuth: (optional("SLB_TOKEN_CLIENT_AUTH") ?? "basic") as
      | "body"
      | "basic",
  };
}

export function getSlbUserOAuthEnv() {
  const token = getSlbTokenEnv();
  return {
    ...token,
    authorizationUrl: required("SLB_AUTHORIZATION_URL"),
    redirectUri: required("SLB_REDIRECT_URI"),
    usePkce: optional("SLB_USE_PKCE") === "true",
  };
}
