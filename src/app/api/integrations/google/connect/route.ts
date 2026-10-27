import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { getGoogleAuthUrl, isGoogleConfigured } from "@/lib/google";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }

  if (!isGoogleConfigured()) {
    const url = new URL("/settings/integrations", process.env.NEXTAUTH_URL ?? "http://localhost:3000");
    url.searchParams.set("error", "not_configured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");
  const response = NextResponse.redirect(getGoogleAuthUrl(state));
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
