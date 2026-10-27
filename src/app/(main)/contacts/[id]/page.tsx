import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, inputClass } from "@/components/ui";
import { addContactActivity } from "../actions";
import { createTaskForEntity } from "../../tasks/actions";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      deals: { include: { property: true } },
      tasks: { orderBy: { dueDate: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
      lead: true,
    },
  });

  if (!contact) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader title={contact.fullName} />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{contact.phone}</span></div>
            <div><span className="text-slate-500">Email:</span> <span className="font-medium">{contact.email ?? "-"}</span></div>
            <div><span className="text-slate-500">Country:</span> <span className="font-medium">{contact.country ?? "-"}</span></div>
            <div><span className="text-slate-500">Language:</span> <span className="font-medium">{contact.preferredLanguage ?? "-"}</span></div>
            <div><span className="text-slate-500">Budget:</span> <span className="font-medium">{contact.currency} {contact.budgetMin ?? "?"} - {contact.budgetMax ?? "?"}</span></div>
            <div><span className="text-slate-500">Lifetime Value:</span> <span className="font-medium">{contact.currency} {contact.lifetimeValue}</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Deals</h2>
            <Link href={`/deals/new?contactId=${contact.id}`} className="text-sm font-medium text-slate-900 hover:underline">
              + New Deal
            </Link>
          </div>
          {contact.deals.length === 0 ? (
            <p className="text-sm text-slate-400">No deals yet.</p>
          ) : (
            <div className="space-y-2">
              {contact.deals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50">
                  <span className="font-medium text-slate-900">{deal.title}</span>
                  <Badge>{deal.stage.replaceAll("_", " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Activity Timeline</h2>
          <form action={addContactActivity} className="mb-4 flex gap-2">
            <input type="hidden" name="contactId" value={contact.id} />
            <select name="type" className={inputClass + " w-40"} defaultValue="NOTE">
              {["CALL", "WHATSAPP", "EMAIL", "SMS", "MEETING", "NOTE", "BROCHURE_SENT", "QUOTATION", "VIEWING"].map((t) => (
                <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input name="content" placeholder="Log a call, message, note..." className={inputClass} />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Log
            </button>
          </form>
          <div className="space-y-3">
            {contact.activities.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
            {contact.activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-slate-200 pl-3">
                <p className="text-xs text-slate-400">
                  {activity.type.replaceAll("_", " ")} · {activity.author?.name ?? "System"} ·{" "}
                  {activity.createdAt.toLocaleString()}
                </p>
                <p className="text-sm text-slate-700">{activity.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Follow-up Tasks</h2>
          <form action={createTaskForEntity} className="mb-4 flex gap-2">
            <input type="hidden" name="contactId" value={contact.id} />
            <input name="title" placeholder="Follow-up task..." className={inputClass} required />
            <input name="dueDate" type="date" className={inputClass + " w-40"} />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {contact.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
            {contact.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span>{task.title}</span>
                <Badge color={task.status === "COMPLETED" ? "green" : "amber"}>{task.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {contact.lead && (
          <Card className="p-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Originating Lead</h2>
            <Link href={`/leads/${contact.lead.id}`} className="text-sm text-slate-700 hover:underline">
              {contact.lead.fullName} · {contact.lead.source.replaceAll("_", " ")}
            </Link>
          </Card>
        )}
        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Preferences</h2>
          <p className="text-sm text-slate-700">{contact.propertyPreferences ?? "Not specified"}</p>
        </Card>
      </div>
    </div>
  );
}
