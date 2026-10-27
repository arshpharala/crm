import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

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
        action={
          <Link href="/meetings/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            + Schedule Meeting
          </Link>
        }
      />

      {meetings.length === 0 ? (
        <EmptyState message="No meetings scheduled yet." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Related To</th>
                <th className="px-4 py-3">Organizer</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Calendar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/meetings/${meeting.id}`} className="font-medium text-slate-900 hover:underline">
                      {meeting.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {meeting.lead?.fullName ?? meeting.contact?.fullName ?? meeting.deal?.title ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{meeting.organizer.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {meeting.startTime.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={STATUS_COLORS[meeting.status]}>{meeting.status.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {meeting.googleEventId ? <Badge color="green">Synced</Badge> : <Badge>Not synced</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
