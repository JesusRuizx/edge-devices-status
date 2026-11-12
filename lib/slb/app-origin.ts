import type { NextRequest } from "next/server";

function isBrowserReachableHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  if (hostname.includes(".")) return true;
  return false;
}

function originFromForwardedHeaders(request: NextRequest): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return null;
  const host = forwardedHost.split(",")[0]?.trim();
  if (!host || !isBrowserReachableHost(host)) return null;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
  return `${proto}://${host}`;
}

function originFromHostHeader(request: NextRequest): string | null {
  const host = request.headers.get("host");
  if (!host || !isBrowserReachableHost(host)) return null;
  return `${request.nextUrl.protocol}//${host}`;
}

function localhostFallback(request: NextRequest): string {
  const host = request.headers.get("host");
  const port = host?.includes(":") ? host.split(":")[1] : null;
  if (port) return `http://localhost:${port}`;
  return request.nextUrl.origin.replace(
    /^https?:\/\/[^/]+/,
    "http://localhost:3000",
  );
}

export function getAppOrigin(request: NextRequest): string {
  const fromEnv = process.env.APP_BASE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  return (
    originFromForwardedHeaders(request) ??
    originFromHostHeader(request) ??
    localhostFallback(request)
  );
}

export function appUrl(request: NextRequest, pathname: string): URL {
  return new URL(pathname, getAppOrigin(request));
}
