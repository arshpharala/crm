"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MeetingStatus, MeetingType } from "@prisma/client";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "@/lib/google";

export async function createMeeting(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const title = String(formData.get("title") ?? "").trim();
  const startTimeRaw = String(formData.get("startTime") ?? "");
  const endTimeRaw = String(formData.get("endTime") ?? "");
  if (!title || !startTimeRaw || !endTimeRaw) throw new Error("Title, start and end time are required");

  const startTime = new Date(startTimeRaw);
  const endTime = new Date(endTimeRaw);
  const location = String(formData.get("location") ?? "") || null;
  const description = String(formData.get("description") ?? "") || null;
  const leadId = String(formData.get("leadId") ?? "") || null;
  const contactId = String(formData.get("contactId") ?? "") || null;
  const dealId = String(formData.get("dealId") ?? "") || null;

  const meeting = await prisma.meeting.create({
    data: {
      title,
      description,
      type: (formData.get("type") as MeetingType) || "OFFICE_MEETING",
      startTime,
      endTime,
      location,
      organizerId: session.user.id,
      leadId,
      contactId,
      dealId,
    },
  });

  const googleEventId = await createCalendarEvent(session.user.id, {
    summary: title,
    description: description ?? undefined,
    location: location ?? undefined,
    startTime,
    endTime,
  });

  if (googleEventId) {
    await prisma.meeting.update({ where: { id: meeting.id }, data: { googleEventId } });
  }

  revalidatePath("/meetings");
  if (leadId) revalidatePath(`/leads/${leadId}`);
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);
  redirect(`/meetings/${meeting.id}`);
}

export async function updateMeetingStatus(meetingId: string, status: MeetingStatus) {
  const session = await auth();
  const meeting = await prisma.meeting.update({ where: { id: meetingId }, data: { status } });

  if (meeting.googleEventId && session?.user?.id) {
    if (status === "CANCELLED") {
      await deleteCalendarEvent(session.user.id, meeting.googleEventId);
    }
  }

  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath("/meetings");
}

export async function rescheduleMeeting(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const meetingId = String(formData.get("meetingId"));
  const startTime = new Date(String(formData.get("startTime")));
  const endTime = new Date(String(formData.get("endTime")));

  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: { startTime, endTime, status: "RESCHEDULED" },
  });

  if (meeting.googleEventId) {
    await updateCalendarEvent(session.user.id, meeting.googleEventId, { startTime, endTime });
  }

  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath("/meetings");
}

export async function addMeetingOutcome(formData: FormData) {
  const meetingId = String(formData.get("meetingId"));
  const outcome = String(formData.get("outcome") ?? "");
  const noShow = formData.get("noShow") === "on";

  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      outcome,
      noShow,
      status: noShow ? "NO_SHOW" : "COMPLETED",
    },
  });

  revalidatePath(`/meetings/${meetingId}`);
  revalidatePath("/meetings");
}
