"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDeveloper(formData: FormData) {
  const session = await auth();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const developer = await prisma.company.create({
    data: {
      name,
      city: String(formData.get("city") ?? "") || null,
      website: String(formData.get("website") ?? "") || null,
      contactDetails: String(formData.get("contactDetails") ?? "") || null,
      registrationStatus: String(formData.get("registrationStatus") ?? "") || null,
      commissionTerms: String(formData.get("commissionTerms") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
      portalLogins: String(formData.get("portalLogins") ?? "") || null,
      createdById: session?.user?.id ?? null,
    },
  });

  revalidatePath("/developers");
  redirect(`/developers/${developer.id}`);
}

export async function createProject(formData: FormData) {
  const session = await auth();
  const developerId = String(formData.get("developerId"));
  const name = String(formData.get("name") ?? "").trim();
  if (!name || !developerId) throw new Error("Name and developer are required");

  const startingPrice = formData.get("startingPrice");
  const launchDateRaw = formData.get("launchDate");
  const completionRaw = formData.get("expectedCompletion");

  await prisma.project.create({
    data: {
      name,
      developerId,
      masterCommunity: String(formData.get("masterCommunity") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      status: String(formData.get("status") ?? "") || null,
      launchDate: launchDateRaw ? new Date(String(launchDateRaw)) : null,
      expectedCompletion: completionRaw ? new Date(String(completionRaw)) : null,
      unitTypes: String(formData.get("unitTypes") ?? "") || null,
      startingPrice: startingPrice ? Number(startingPrice) : null,
      paymentPlan: String(formData.get("paymentPlan") ?? "") || null,
      amenities: String(formData.get("amenities") ?? "") || null,
      createdById: session?.user?.id ?? null,
    },
  });

  revalidatePath(`/developers/${developerId}`);
}
