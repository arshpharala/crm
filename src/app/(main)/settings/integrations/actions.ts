"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function disconnectGoogle() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.googleConnection.deleteMany({ where: { userId: session.user.id } });
  revalidatePath("/settings/integrations");
}
