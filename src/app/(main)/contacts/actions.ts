"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createContact(formData: FormData) {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!fullName || !phone) throw new Error("Full name and phone are required");

  const budgetMin = formData.get("budgetMin");
  const budgetMax = formData.get("budgetMax");

  const contact = await prisma.contact.create({
    data: {
      fullName,
      phone,
      email: String(formData.get("email") ?? "") || null,
      country: String(formData.get("country") ?? "") || null,
      preferredLanguage: String(formData.get("preferredLanguage") ?? "") || null,
      currency: String(formData.get("currency") ?? "AED"),
      budgetMin: budgetMin ? Number(budgetMin) : null,
      budgetMax: budgetMax ? Number(budgetMax) : null,
      propertyPreferences: String(formData.get("propertyPreferences") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  revalidatePath("/contacts");
  redirect(`/contacts/${contact.id}`);
}

export async function addContactActivity(formData: FormData) {
  const session = await auth();
  const contactId = String(formData.get("contactId"));
  const type = formData.get("type") as string;
  const content = String(formData.get("content") ?? "");

  await prisma.activity.create({
    data: {
      type: type as never,
      content,
      authorId: session?.user?.id,
      contactId,
    },
  });
  revalidatePath(`/contacts/${contactId}`);
}
