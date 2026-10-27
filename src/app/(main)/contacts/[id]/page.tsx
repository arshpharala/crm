import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, LinkButton, PageHeader, SectionTitle, inputClass } from "@/components/ui";
import { CalendarIcon, PlusIcon } from "@/components/icons";
import { addContactActivity } from "../actions";
import { createTaskForEntity } from "../../tasks/actions";

const STAGE_COLORS: Record<string, string> = { CLOSED_WON: "green", CLOSED_LOST: "red" };

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
        <PageHeader
          title={contact.fullName}
          subtitle={contact.phone}
          action={
            <LinkButton href={`/meetings/new?contactId=${contact.id}`} variant="secondary">
              <CalendarIcon size={16} /> Schedule Meeting
            </LinkButton>
          }
        />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Phone</p><p className="font-medium text-slate-900">{contact.phone}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Email</p><p className="font-medium text-slate-900">{contact.email ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Country</p><p className="font-medium text-slate-900">{contact.country ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Language</p><p className="font-medium text-slate-900">{contact.preferredLanguage ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Budget</p><p className="font-medium text-slate-900">{contact.currency} {contact.budgetMin ?? "?"} - {contact.budgetMax ?? "?"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Lifetime Value</p><p className="font-medium text-slate-900">{contact.currency} {contact.lifetimeValue.toLocaleString()}</p></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Deals</SectionTitle>
            <Link href={`/deals/new?contactId=${contact.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              <PlusIcon size={14} /> New Deal
            </Link>
          </div>
          {contact.deals.length === 0 ? (
            <p className="text-sm text-slate-400">No deals yet.</p>
          ) : (
            <div className="space-y-2">
              {contact.deals.map((deal) => (
                <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm hover:bg-slate-50">
                  <span className="font-medium text-slate-900">{deal.title}</span>
                  <Badge color={STAGE_COLORS[deal.stage] ?? "slate"}>{deal.stage.replaceAll("_", " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle>Activity Timeline</SectionTitle>
          <form action={addContactActivity} className="mb-4 flex gap-2">
            <input type="hidden" name="contactId" value={contact.id} />
            <select name="type" className={inputClass + " w-40"} defaultValue="NOTE">
              {["CALL", "WHATSAPP", "EMAIL", "SMS", "MEETING", "NOTE", "BROCHURE_SENT", "QUOTATION", "VIEWING"].map((t) => (
                <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input name="content" placeholder="Log a call, message, note..." className={inputClass} />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Log
            </button>
          </form>
          <div className="space-y-3">
            {contact.activities.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
            {contact.activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-slate-200 pl-3">
                <p className="text-xs text-slate-400">
                  <Badge>{activity.type.replaceAll("_", " ")}</Badge>{" "}
                  <span className="ml-1">{activity.author?.name ?? "System"} · {activity.createdAt.toLocaleString()}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">{activity.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Follow-up Tasks</SectionTitle>
          <form action={createTaskForEntity} className="mb-4 flex gap-2">
            <input type="hidden" name="contactId" value={contact.id} />
            <input name="title" placeholder="Follow-up task..." className={inputClass} required />
            <input name="dueDate" type="date" className={inputClass + " w-40"} />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {contact.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
            {contact.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm">
                <span>{task.title}</span>
                <Badge color={task.status === "COMPLETED" ? "green" : "amber"} dot>{task.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        {contact.lead && (
          <Card className="p-6">
            <SectionTitle>Originating Lead</SectionTitle>
            <Link href={`/leads/${contact.lead.id}`} className="text-sm text-slate-700 hover:underline">
              {contact.lead.fullName} · {contact.lead.source.replaceAll("_", " ")}
            </Link>
          </Card>
        )}
        <Card className="p-6">
          <SectionTitle>Preferences</SectionTitle>
          <p className="text-sm text-slate-700">{contact.propertyPreferences ?? "Not specified"}</p>
        </Card>
      </div>
    </div>
  );
}
