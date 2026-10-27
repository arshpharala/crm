"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { TaskPriority, TaskStatus } from "@prisma/client";

export async function createTaskForEntity(formData: FormData) {
  const session = await auth();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");

  const dueDateRaw = formData.get("dueDate");
  const leadId = String(formData.get("leadId") ?? "") || null;
  const contactId = String(formData.get("contactId") ?? "") || null;
  const dealId = String(formData.get("dealId") ?? "") || null;

  await prisma.task.create({
    data: {
      title,
      dueDate: dueDateRaw ? new Date(String(dueDateRaw)) : null,
      priority: (formData.get("priority") as TaskPriority) || "MEDIUM",
      assigneeId: String(formData.get("assigneeId") ?? "") || session?.user?.id,
      leadId,
      contactId,
      dealId,
    },
  });

  if (leadId) revalidatePath(`/leads/${leadId}`);
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);
  revalidatePath("/tasks");
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");
  const dueDateRaw = formData.get("dueDate");

  await prisma.task.create({
    data: {
      title,
      description: String(formData.get("description") ?? "") || null,
      dueDate: dueDateRaw ? new Date(String(dueDateRaw)) : null,
      priority: (formData.get("priority") as TaskPriority) || "MEDIUM",
      assigneeId: String(formData.get("assigneeId") ?? "") || null,
    },
  });
  revalidatePath("/tasks");
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/tasks");
}
