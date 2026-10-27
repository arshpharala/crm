import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exchangeCodeForTokens, fetchGoogleEmail } from "@/lib/google";

export async function GET(request: NextRequest) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", base));
  }

  const settingsUrl = new URL("/settings/integrations", base);

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("google_oauth_state")?.value;

  if (!code || !state || !storedState || state !== storedState) {
    settingsUrl.searchParams.set("error", "invalid_state");
    return NextResponse.redirect(settingsUrl);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const email = await fetchGoogleEmail(tokens.access_token);

    if (!tokens.refresh_token) {
      settingsUrl.searchParams.set("error", "no_refresh_token");
      return NextResponse.redirect(settingsUrl);
    }

    await prisma.googleConnection.upsert({
      where: { userId: session.user.id },
      update: {
        googleEmail: email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      },
      create: {
        userId: session.user.id,
        googleEmail: email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: tokens.scope,
      },
    });

    settingsUrl.searchParams.set("connected", "1");
    const response = NextResponse.redirect(settingsUrl);
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    settingsUrl.searchParams.set("error", "exchange_failed");
    return NextResponse.redirect(settingsUrl);
  }
}
