import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { createMeeting } from "../actions";
import { Card, PageHeader, SubmitButton, inputClass, labelClass } from "@/components/ui";

export default async function NewMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; contactId?: string; dealId?: string }>;
}) {
  const { leadId, contactId, dealId } = await searchParams;
  const session = await auth();

  const [leads, contacts, deals, googleConnection] = await Promise.all([
    prisma.lead.findMany({ orderBy: { fullName: "asc" } }),
    prisma.contact.findMany({ orderBy: { fullName: "asc" } }),
    prisma.deal.findMany({ orderBy: { title: "asc" } }),
    session?.user ? prisma.googleConnection.findUnique({ where: { userId: session.user.id } }) : null,
  ]);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Schedule Meeting" />

      {!googleConnection && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your Google Calendar isn&apos;t connected, so this meeting will be tracked in the CRM only.{" "}
          <a href="/settings/integrations" className="font-medium underline">Connect it</a> to sync automatically.
        </div>
      )}

      <Card className="p-6">
        <form action={createMeeting} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="title">Title *</label>
            <input id="title" name="title" required className={inputClass} placeholder="Property viewing - Marina Gate" />
          </div>

          <div>
            <label className={labelClass} htmlFor="type">Type</label>
            <select id="type" name="type" className={inputClass} defaultValue="OFFICE_MEETING">
              <option value="OFFICE_MEETING">Office meeting</option>
              <option value="DEVELOPER_MEETING">Developer meeting</option>
              <option value="PROPERTY_VIEWING">Property viewing</option>
              <option value="CLIENT_VISIT">Client visit</option>
              <option value="VIRTUAL">Virtual</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="location">Location / Link</label>
            <input id="location" name="location" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="startTime">Start Time *</label>
            <input id="startTime" name="startTime" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endTime">End Time *</label>
            <input id="endTime" name="endTime" type="datetime-local" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass} htmlFor="leadId">Lead</label>
            <select id="leadId" name="leadId" className={inputClass} defaultValue={leadId ?? ""}>
              <option value="">None</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="contactId">Contact</label>
            <select id="contactId" name="contactId" className={inputClass} defaultValue={contactId ?? ""}>
              <option value="">None</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.fullName}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="dealId">Deal</label>
            <select id="dealId" name="dealId" className={inputClass} defaultValue={dealId ?? ""}>
              <option value="">None</option>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>{deal.title}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className={labelClass} htmlFor="description">Notes</label>
            <textarea id="description" name="description" className={inputClass} rows={3} />
          </div>

          <div className="col-span-2 mt-2">
            <SubmitButton>Schedule Meeting</SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
