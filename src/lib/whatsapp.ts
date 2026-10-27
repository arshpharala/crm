import { createHmac, timingSafeEqual } from "crypto";

const GRAPH_VERSION = "v21.0";

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_VERIFY_TOKEN
  );
}

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true; // no secret configured yet — allow during initial setup
  if (!signatureHeader) return false;

  const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function normalizePhoneNumber(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}

type SendResult = { waMessageId: string | null; ok: boolean; error?: string };

export async function sendTextMessage(toPhoneNumber: string, text: string): Promise<SendResult> {
  if (!isWhatsAppConfigured()) {
    return { waMessageId: null, ok: false, error: "WhatsApp is not configured" };
  }

  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhoneNumber.replace("+", ""),
      type: "text",
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("WhatsApp send failed", errorText);
    return { waMessageId: null, ok: false, error: errorText };
  }

  const data = await res.json();
  const waMessageId = data?.messages?.[0]?.id ?? null;
  return { waMessageId, ok: true };
}

export function getWebhookUrl() {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base}/api/integrations/whatsapp/webhook`;
}
