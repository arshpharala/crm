"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { sendTextMessage } from "@/lib/whatsapp";
import type { ConversationStatus } from "@prisma/client";

export async function sendReply(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversationId = String(formData.get("conversationId"));
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  const conversation = await prisma.whatsAppConversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new Error("Conversation not found");

  const result = await sendTextMessage(conversation.phoneNumber, content);

  await prisma.whatsAppMessage.create({
    data: {
      conversationId,
      direction: "OUTBOUND",
      content,
      authorId: session.user.id,
      waMessageId: result.waMessageId,
      status: result.ok ? "SENT" : "FAILED",
    },
  });

  await prisma.whatsAppConversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  if (conversation.leadId || conversation.contactId) {
    await prisma.activity.create({
      data: {
        type: "WHATSAPP",
        content,
        authorId: session.user.id,
        leadId: conversation.leadId,
        contactId: conversation.contactId,
      },
    });
  }

  revalidatePath(`/whatsapp/${conversationId}`);
  revalidatePath("/whatsapp");
}

export async function assignConversation(formData: FormData) {
  const conversationId = String(formData.get("conversationId"));
  const agentId = String(formData.get("agentId") ?? "") || null;

  await prisma.whatsAppConversation.update({
    where: { id: conversationId },
    data: { assignedAgentId: agentId },
  });

  revalidatePath(`/whatsapp/${conversationId}`);
  revalidatePath("/whatsapp");
}

export async function updateConversationStatus(conversationId: string, status: ConversationStatus) {
  await prisma.whatsAppConversation.update({ where: { id: conversationId }, data: { status } });
  revalidatePath(`/whatsapp/${conversationId}`);
  revalidatePath("/whatsapp");
}

export async function tagConversation(formData: FormData) {
  const conversationId = String(formData.get("conversationId"));
  const tags = String(formData.get("tags") ?? "");

  await prisma.whatsAppConversation.update({ where: { id: conversationId }, data: { tags } });
  revalidatePath(`/whatsapp/${conversationId}`);
}
