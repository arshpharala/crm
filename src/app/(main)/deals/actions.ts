"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { DealStage, DealType } from "@prisma/client";

export async function createDeal(formData: FormData) {
  const session = await auth();
  const title = String(formData.get("title") ?? "").trim();
  const contactId = String(formData.get("contactId") ?? "");
  if (!title || !contactId) throw new Error("Title and contact are required");

  const value = formData.get("value");
  const propertyId = String(formData.get("propertyId") ?? "") || null;

  const deal = await prisma.deal.create({
    data: {
      title,
      contactId,
      propertyId,
      type: (formData.get("type") as DealType) || "SECONDARY",
      value: value ? Number(value) : null,
      currency: String(formData.get("currency") ?? "AED"),
      agentId: session?.user?.id,
    },
  });

  revalidatePath("/deals");
  redirect(`/deals/${deal.id}`);
}

export async function updateDealStage(dealId: string, stage: DealStage) {
  const data: { stage: DealStage; closedAt?: Date | null } = { stage };
  if (stage === "CLOSED_WON" || stage === "CLOSED_LOST") {
    data.closedAt = new Date();
  }
  await prisma.deal.update({ where: { id: dealId }, data });
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/deals");
}

export async function addDealActivity(formData: FormData) {
  const session = await auth();
  const dealId = String(formData.get("dealId"));
  const type = formData.get("type") as string;
  const content = String(formData.get("content") ?? "");

  await prisma.activity.create({
    data: { type: type as never, content, authorId: session?.user?.id, dealId },
  });
  revalidatePath(`/deals/${dealId}`);
}
