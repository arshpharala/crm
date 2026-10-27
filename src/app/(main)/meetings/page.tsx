import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, LinkButton, PageHeader, PersonChip, Td, Th, TableShell } from "@/components/ui";
import { CalendarIcon, PlusIcon } from "@/components/icons";

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "blue",
  COMPLETED: "green",
  CANCELLED: "red",
  NO_SHOW: "amber",
  RESCHEDULED: "slate",
};

export default async function MeetingsPage() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { startTime: "asc" },
    include: { organizer: true, lead: true, contact: true, deal: true },
  });

  return (
    <div>
      <PageHeader
        title="Meetings, Viewings & Calendar"
        subtitle={`${meetings.length} scheduled`}
        action={
          <LinkButton href="/meetings/new">
            <PlusIcon size={16} /> Schedule Meeting
          </LinkButton>
        }
      />

      {meetings.length === 0 ? (
        <EmptyState message="No meetings scheduled yet." icon={<CalendarIcon size={28} />} />
      ) : (
        <TableShell>
          <thead className="border-b border-slate-100">
            <tr>
              <Th>Title</Th>
              <Th>Related To</Th>
              <Th>Organizer</Th>
              <Th>When</Th>
              <Th>Status</Th>
              <Th>Calendar</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="hover:bg-slate-50/80">
                <Td>
                  <Link href={`/meetings/${meeting.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {meeting.title}
                  </Link>
                </Td>
                <Td className="text-slate-600">
                  {meeting.lead?.fullName ?? meeting.contact?.fullName ?? meeting.deal?.title ?? "-"}
                </Td>
                <Td><PersonChip name={meeting.organizer.name} /></Td>
                <Td className="text-slate-600">{meeting.startTime.toLocaleString()}</Td>
                <Td><Badge color={STATUS_COLORS[meeting.status]} dot>{meeting.status.replaceAll("_", " ")}</Badge></Td>
                <Td>{meeting.googleEventId ? <Badge color="green">Synced</Badge> : <Badge>Not synced</Badge>}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
