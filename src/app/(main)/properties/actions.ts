"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PropertyCategory, PropertyAvailability } from "@prisma/client";

export async function createProperty(formData: FormData) {
  const session = await auth();
  const title = String(formData.get("title") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);

  if (!title || !reference || !price) throw new Error("Title, reference and price are required");

  const projectId = String(formData.get("projectId") ?? "") || null;

  const property = await prisma.property.create({
    data: {
      title,
      reference,
      category: (formData.get("category") as PropertyCategory) || "SECONDARY_SALE",
      emirate: String(formData.get("emirate") ?? "") || null,
      area: String(formData.get("area") ?? "") || null,
      community: String(formData.get("community") ?? "") || null,
      building: String(formData.get("building") ?? "") || null,
      projectId,
      unitNumber: String(formData.get("unitNumber") ?? "") || null,
      bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null,
      bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
      builtUpArea: formData.get("builtUpArea") ? Number(formData.get("builtUpArea")) : null,
      price,
      paymentPlan: String(formData.get("paymentPlan") ?? "") || null,
      availability: (formData.get("availability") as PropertyAvailability) || "AVAILABLE",
      listingAgentId: session?.user?.id,
      publicationStatus: "DRAFT",
    },
  });

  revalidatePath("/properties");
  redirect(`/properties/${property.id}`);
}

export async function updatePropertyAvailability(propertyId: string, availability: PropertyAvailability) {
  await prisma.property.update({ where: { id: propertyId }, data: { availability } });
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath("/properties");
}
