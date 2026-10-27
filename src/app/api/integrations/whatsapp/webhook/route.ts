import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber, verifyWebhookSignature } from "@/lib/whatsapp";
import type { MessageStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

type WhatsAppWebhookMessage = {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};

type WhatsAppWebhookStatus = {
  id: string;
  status: string;
  recipient_id: string;
};

const STATUS_MAP: Record<string, MessageStatus> = {
  sent: "SENT",
  delivered: "DELIVERED",
  read: "READ",
  failed: "FAILED",
};

async function findMatchingLeadOrContact(phoneNumber: string) {
  const digits = phoneNumber.replace(/[^\d]/g, "");
  const last9 = digits.slice(-9);

  const lead = await prisma.lead.findFirst({
    where: { phone: { contains: last9 } },
    orderBy: { createdAt: "desc" },
  });
  if (lead) return { leadId: lead.id, contactId: null as string | null };

  const contact = await prisma.contact.findFirst({
    where: { phone: { contains: last9 } },
    orderBy: { createdAt: "desc" },
  });
  if (contact) return { leadId: null as string | null, contactId: contact.id };

  return { leadId: null as string | null, contactId: null as string | null };
}

async function handleInboundMessage(message: WhatsAppWebhookMessage, displayName: string | null) {
  const phoneNumber = normalizePhoneNumber(message.from);

  let conversation = await prisma.whatsAppConversation.findUnique({ where: { phoneNumber } });

  if (!conversation) {
    const match = await findMatchingLeadOrContact(phoneNumber);
    let leadId = match.leadId;
    const contactId = match.contactId;

    if (!leadId && !contactId) {
      const newLead = await prisma.lead.create({
        data: {
          fullName: displayName ?? phoneNumber,
          phone: phoneNumber,
          source: "WHATSAPP",
          stage: "NEW",
        },
      });
      leadId = newLead.id;
    }

    conversation = await prisma.whatsAppConversation.create({
      data: {
        phoneNumber,
        displayName,
        leadId,
        contactId,
      },
    });
  }

  const content = message.type === "text" ? message.text?.body ?? "" : `[${message.type} message]`;

  await prisma.whatsAppMessage.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      content,
      waMessageId: message.id,
      status: "RECEIVED",
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date(), lastInboundAt: new Date(), status: "OPEN" },
  });

  await prisma.activity.create({
    data: {
      type: "WHATSAPP",
      content,
      leadId: conversation.leadId,
      contactId: conversation.contactId,
    },
  });
}

async function handleStatusUpdate(status: WhatsAppWebhookStatus) {
  const mapped = STATUS_MAP[status.status];
  if (!mapped) return;

  await prisma.whatsAppMessage.updateMany({
    where: { waMessageId: status.id },
    data: { status: mapped },
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;

        for (const message of value?.messages ?? []) {
          const displayName = value?.contacts?.[0]?.profile?.name ?? null;
          await handleInboundMessage(message, displayName);
        }

        for (const status of value?.statuses ?? []) {
          await handleStatusUpdate(status);
        }
      }
    }
  } catch (error) {
    console.error("Failed to process WhatsApp webhook", error);
  }

  return new NextResponse("OK", { status: 200 });
}
