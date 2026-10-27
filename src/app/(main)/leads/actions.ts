"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LeadSource, LeadStage, LeadTemperature, InvestmentPurpose } from "@prisma/client";

export async function createLead(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName || !phone) throw new Error("Full name and phone are required");

  const budgetMin = formData.get("budgetMin");
  const budgetMax = formData.get("budgetMax");

  await prisma.lead.create({
    data: {
      fullName,
      phone,
      email: String(formData.get("email") ?? "") || null,
      country: String(formData.get("country") ?? "") || null,
      preferredLanguage: String(formData.get("preferredLanguage") ?? "") || null,
      source: (formData.get("source") as LeadSource) || "MANUAL",
      propertyInterest: String(formData.get("propertyInterest") ?? "") || null,
      budgetMin: budgetMin ? Number(budgetMin) : null,
      budgetMax: budgetMax ? Number(budgetMax) : null,
      currency: String(formData.get("currency") ?? "AED"),
      purpose: (formData.get("purpose") as InvestmentPurpose) || null,
      temperature: (formData.get("temperature") as LeadTemperature) || "WARM",
      assignedAgentId: String(formData.get("assignedAgentId") ?? "") || null,
      assignedById: session.user.id,
      stage: formData.get("assignedAgentId") ? "ASSIGNED" : "UNASSIGNED",
    },
  });

  revalidatePath("/leads");
  redirect("/leads");
}

export async function updateLeadStage(leadId: string, stage: LeadStage) {
  await prisma.lead.update({ where: { id: leadId }, data: { stage } });
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function assignLead(leadId: string, agentId: string) {
  const session = await auth();
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      assignedAgentId: agentId || null,
      assignedById: session?.user?.id,
      stage: agentId ? "ASSIGNED" : "UNASSIGNED",
    },
  });
  await prisma.activity.create({
    data: {
      type: "ASSIGNMENT",
      content: agentId ? `Lead assigned` : "Lead unassigned",
      authorId: session?.user?.id,
      leadId,
    },
  });
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
}

export async function addLeadActivity(formData: FormData) {
  const session = await auth();
  const leadId = String(formData.get("leadId"));
  const type = formData.get("type") as string;
  const content = String(formData.get("content") ?? "");

  await prisma.activity.create({
    data: {
      type: type as never,
      content,
      authorId: session?.user?.id,
      leadId,
    },
  });
  revalidatePath(`/leads/${leadId}`);
}

export async function convertLeadToContact(leadId: string) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found");

  const contact = await prisma.contact.create({
    data: {
      fullName: lead.fullName,
      email: lead.email,
      phone: lead.phone,
      country: lead.country,
      preferredLanguage: lead.preferredLanguage,
      currency: lead.currency,
      budgetMin: lead.budgetMin,
      budgetMax: lead.budgetMax,
      propertyPreferences: lead.propertyInterest,
      referralSource: lead.source,
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: { convertedContactId: contact.id, stage: "QUALIFIED" },
  });

  revalidatePath("/leads");
  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}
