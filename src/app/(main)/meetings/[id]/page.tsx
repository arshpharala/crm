import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { addMeetingOutcome, updateMeetingStatus } from "../actions";

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: { organizer: true, lead: true, contact: true, deal: true },
  });

  if (!meeting) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader title={meeting.title} />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Type:</span> <span className="font-medium">{meeting.type.replaceAll("_", " ")}</span></div>
            <div><span className="text-slate-500">Organizer:</span> <span className="font-medium">{meeting.organizer.name}</span></div>
            <div><span className="text-slate-500">Start:</span> <span className="font-medium">{meeting.startTime.toLocaleString()}</span></div>
            <div><span className="text-slate-500">End:</span> <span className="font-medium">{meeting.endTime.toLocaleString()}</span></div>
            <div><span className="text-slate-500">Location:</span> <span className="font-medium">{meeting.location ?? "-"}</span></div>
            <div>
              <span className="text-slate-500">Related:</span>{" "}
              <span className="font-medium">
                {meeting.lead ? <Link href={`/leads/${meeting.lead.id}`} className="hover:underline">{meeting.lead.fullName}</Link> : null}
                {meeting.contact ? <Link href={`/contacts/${meeting.contact.id}`} className="hover:underline">{meeting.contact.fullName}</Link> : null}
                {meeting.deal ? <Link href={`/deals/${meeting.deal.id}`} className="hover:underline">{meeting.deal.title}</Link> : null}
                {!meeting.lead && !meeting.contact && !meeting.deal ? "-" : null}
              </span>
            </div>
          </div>
          {meeting.description && <p className="mt-4 text-sm text-slate-600">{meeting.description}</p>}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Outcome</h2>
          {meeting.outcome ? (
            <div>
              <p className="text-sm text-slate-700">{meeting.outcome}</p>
              {meeting.noShow && <Badge color="amber">Client did not show</Badge>}
            </div>
          ) : (
            <form action={addMeetingOutcome} className="space-y-3">
              <input type="hidden" name="meetingId" value={meeting.id} />
              <textarea
                name="outcome"
                placeholder="Viewing feedback, decisions made, next steps..."
                className={inputClass}
                rows={3}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="noShow" />
                Client did not show up
              </label>
              <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Save Outcome
              </button>
            </form>
          )}
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Status</h2>
          <form action={async (formData) => { "use server"; await updateMeetingStatus(meeting.id, formData.get("status") as never); }}>
            <AutoSubmitSelect name="status" defaultValue={meeting.status} className={inputClass}>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No show</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </AutoSubmitSelect>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Google Calendar</h2>
          {meeting.googleEventId ? (
            <Badge color="green">Synced</Badge>
          ) : (
            <Badge>Not synced</Badge>
          )}
        </Card>
      </div>
    </div>
  );
}
