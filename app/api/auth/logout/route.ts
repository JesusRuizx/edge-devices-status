import { getAppOrigin } from "@/lib/slb/app-origin";
import { clearUserSession } from "@/lib/slb/session-cookies";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await clearUserSession();
  return NextResponse.redirect(new URL("/", getAppOrigin(request)));
}
