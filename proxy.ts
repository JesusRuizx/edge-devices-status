import { handleAuthGuard } from "@/lib/slb/auth-guard";
import type { NextRequest } from "next/server";

/** Auth guard: redirect unauthenticated users to sign-in. */
function proxy(request: NextRequest) {
  return handleAuthGuard(request);
}

export default proxy;
export { proxy };

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
