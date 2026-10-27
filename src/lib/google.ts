import { prisma } from "@/lib/prisma";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

function getRedirectUri() {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/api/integrations/google/callback`;
}

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleAuthUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: GOOGLE_CALENDAR_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${await res.text()}`);
  }

  return res.json();
}

export async function fetchGoogleEmail(accessToken: string): Promise<string> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google user info");
  const data = await res.json();
  return data.email as string;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${await res.text()}`);
  }

  return res.json();
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const connection = await prisma.googleConnection.findUnique({ where: { userId } });
  if (!connection) return null;

  if (connection.expiresAt.getTime() > Date.now() + 60_000) {
    return connection.accessToken;
  }

  const refreshed = await refreshAccessToken(connection.refreshToken);
  const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000);

  await prisma.googleConnection.update({
    where: { userId },
    data: { accessToken: refreshed.access_token, expiresAt },
  });

  return refreshed.access_token;
}

type CalendarEventInput = {
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails?: string[];
};

export async function createCalendarEvent(
  userId: string,
  event: CalendarEventInput
): Promise<string | null> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return null;

  const res = await fetch(GOOGLE_CALENDAR_EVENTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: { dateTime: event.startTime.toISOString() },
      end: { dateTime: event.endTime.toISOString() },
      attendees: event.attendeeEmails?.map((email) => ({ email })),
    }),
  });

  if (!res.ok) {
    console.error("Failed to create Google Calendar event", await res.text());
    return null;
  }

  const data = await res.json();
  return data.id as string;
}

export async function updateCalendarEvent(
  userId: string,
  googleEventId: string,
  event: Partial<CalendarEventInput>
): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return false;

  const body: Record<string, unknown> = {};
  if (event.summary) body.summary = event.summary;
  if (event.description !== undefined) body.description = event.description;
  if (event.location !== undefined) body.location = event.location;
  if (event.startTime) body.start = { dateTime: event.startTime.toISOString() };
  if (event.endTime) body.end = { dateTime: event.endTime.toISOString() };

  const res = await fetch(`${GOOGLE_CALENDAR_EVENTS_URL}/${googleEventId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return res.ok;
}

export async function deleteCalendarEvent(userId: string, googleEventId: string): Promise<boolean> {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return false;

  const res = await fetch(`${GOOGLE_CALENDAR_EVENTS_URL}/${googleEventId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return res.ok || res.status === 410;
}
