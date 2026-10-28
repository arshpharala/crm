"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LeadSource, LeadStage, LeadTemperature, InvestmentPurpose } from "@prisma/client";
import { canEditLead, canEditAnyLead, canManageTeam, ROLE_PERMISSIONS } from "@/lib/permissions";

export async function createLead(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Verify the session user still exists in the DB (guards against stale JWT after DB reset)
  const sessionUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, teamId: true },
  });
  if (!sessionUser) return { error: "Your session is invalid. Please sign out and sign in again." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName || !phone) return { error: "Full name and phone are required" };

  const budgetMin = formData.get("budgetMin");
  const budgetMax = formData.get("budgetMax");
  const assignedAgentId = String(formData.get("assignedAgentId") ?? "") || null;

  if (assignedAgentId && canManageTeam(sessionUser.role)) {
    const target = await prisma.user.findUnique({ where: { id: assignedAgentId }, select: { teamId: true, active: true } });
    if (!target || !target.active || target.teamId !== sessionUser.teamId) {
      return { error: "You can only assign leads to members of your own team." };
    }
  }

  try {
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
        assignedAgentId,
        assignedById: session.user.id,
        stage: assignedAgentId ? "ASSIGNED" : "UNASSIGNED",
        createdById: session.user.id,
      },
    });
  } catch (err) {
    console.error("createLead error:", err);
    return { error: "Failed to save lead. Please try again." };
  }

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
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sessionUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, teamId: true },
  });
  if (!sessionUser) throw new Error("Your session is invalid. Please sign out and sign in again.");

  const role = sessionUser.role;
  const isAgentScope = ROLE_PERMISSIONS[role].leads === "own";

  // Agents with "own" scope can only assign the lead to themselves (or leave unassigned)
  if (isAgentScope && agentId && agentId !== sessionUser.id) {
    throw new Error("You can only assign leads to yourself.");
  }

  // Team leaders / sales managers can only assign within their own team
  if (agentId && canManageTeam(role)) {
    const target = await prisma.user.findUnique({ where: { id: agentId }, select: { teamId: true, active: true } });
    if (!target || !target.active || target.teamId !== sessionUser.teamId) {
      throw new Error("You can only assign leads to members of your own team.");
    }
  }

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

export async function updateLeadDetails(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized", success: false };

  const role = session.user.role;
  if (!canEditLead(role)) return { error: "You don't have permission to edit lead details.", success: false };

  const leadId = String(formData.get("leadId") ?? "");
  if (!leadId) return { error: "Lead ID missing.", success: false };

  // For agents with "own" scope, verify they are assigned to this lead
  if (!canEditAnyLead(role)) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId }, select: { assignedAgentId: true } });
    if (!lead) return { error: "Lead not found.", success: false };
    if (lead.assignedAgentId !== session.user.id) {
      return { error: "You can only edit leads assigned to you.", success: false };
    }
  }

  const budgetMin = formData.get("budgetMin");
  const budgetMax = formData.get("budgetMax");
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const propertyInterest = String(formData.get("propertyInterest") ?? "").trim();
  const currency = String(formData.get("currency") ?? "AED");
  const purpose = formData.get("purpose") as InvestmentPurpose | null;

  if (!phone) return { error: "Phone number is required.", success: false };

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        phone,
        email: email || null,
        country: country || null,
        propertyInterest: propertyInterest || null,
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        currency,
        purpose: purpose || null,
      },
    });
  } catch (err) {
    console.error("updateLeadDetails error:", err);
    return { error: "Failed to save changes. Please try again.", success: false };
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/leads");
  return { error: null, success: true };
}
