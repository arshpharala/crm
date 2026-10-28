"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { canManageUsers } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

async function requireUserManager() {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user.role)) {
    throw new Error("You don't have permission to manage users");
  }
  return session;
}

export async function createUser(formData: FormData) {
  await requireUserManager();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") as Role;

  if (!name || !email || !password || !role) {
    throw new Error("Name, email, password and role are required");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const teamId = String(formData.get("teamId") ?? "") || null;
  const isTeamLeader = formData.get("isTeamLeader") === "on";

  const created = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
      phone: String(formData.get("phone") ?? "") || null,
      teamId,
    },
  });

  if (isTeamLeader && teamId) {
    await prisma.team.update({ where: { id: teamId }, data: { leaderId: created.id } });
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(formData: FormData) {
  await requireUserManager();

  const userId = String(formData.get("userId"));
  const name = String(formData.get("name") ?? "").trim();
  const role = formData.get("role") as Role;
  if (!name || !role) throw new Error("Name and role are required");

  const teamId = String(formData.get("teamId") ?? "") || null;
  const isTeamLeader = formData.get("isTeamLeader") === "on";

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      role,
      phone: String(formData.get("phone") ?? "") || null,
      teamId,
    },
  });

  // Clear leadership of any team this user currently leads (handles team change / unchecking),
  // then re-apply if the admin still wants them leading the (possibly new) selected team.
  await prisma.team.updateMany({ where: { leaderId: userId }, data: { leaderId: null } });
  if (isTeamLeader && teamId) {
    await prisma.team.update({ where: { id: teamId }, data: { leaderId: userId } });
  }

  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
  revalidatePath("/team");
}

export async function toggleUserActive(userId: string, active: boolean) {
  const session = await requireUserManager();

  if (session.user.id === userId && !active) {
    throw new Error("You can't deactivate your own account");
  }

  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/users");
  revalidatePath(`/users/${userId}`);
}

export async function resetPassword(formData: FormData) {
  await requireUserManager();

  const userId = String(formData.get("userId"));
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { password: passwordHash } });

  revalidatePath(`/users/${userId}`);
}

export async function createTeam(formData: FormData) {
  await requireUserManager();

  const name = String(formData.get("teamName") ?? "").trim();
  if (!name) throw new Error("Team name is required");

  await prisma.team.create({ data: { name } });
  revalidatePath("/users/new");
  revalidatePath("/users");
}
