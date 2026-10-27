import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar, Badge, Card, LinkButton, PageHeader, PersonChip, SectionTitle, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { CalendarIcon } from "@/components/icons";
import { DEAL_STAGES } from "@/lib/constants";
import { addDealActivity, updateDealStage } from "../actions";
import { createTaskForEntity } from "../../tasks/actions";

const ACTIVITY_COLORS: Record<string, string> = {
  CALL: "blue",
  WHATSAPP: "green",
  EMAIL: "indigo",
  MEETING: "violet",
  OFFER: "amber",
  CONTRACT: "slate",
  PAYMENT: "green",
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      contact: true,
      property: true,
      agent: true,
      tasks: { orderBy: { dueDate: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });

  if (!deal) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader
          title={deal.title}
          subtitle={deal.type.replaceAll("_", " ")}
          action={
            <LinkButton href={`/meetings/new?dealId=${deal.id}`} variant="secondary">
              <CalendarIcon size={16} /> Schedule Meeting
            </LinkButton>
          }
        />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Contact</p>
              <Link href={`/contacts/${deal.contact.id}`} className="hover:underline">
                <PersonChip name={deal.contact.fullName} />
              </Link>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Property</p>
              {deal.property ? (
                <Link href={`/properties/${deal.property.id}`} className="font-medium text-slate-900 hover:underline">
                  {deal.property.title}
                </Link>
              ) : (
                <span className="text-slate-400">Not selected yet</span>
              )}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Deal Value</p>
              <p className="text-base font-semibold text-slate-900">
                {deal.value ? `${deal.currency} ${deal.value.toLocaleString()}` : "-"}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Agent</p>
              {deal.agent ? <PersonChip name={deal.agent.name} /> : <span className="text-slate-400">Unassigned</span>}
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Commission</p>
              <p className="font-medium text-slate-900">{deal.commissionAmount ? `${deal.currency} ${deal.commissionAmount}` : "-"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Activity Timeline</SectionTitle>
          <form action={addDealActivity} className="mb-4 flex gap-2">
            <input type="hidden" name="dealId" value={deal.id} />
            <select name="type" className={inputClass + " w-40"} defaultValue="NOTE">
              {["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE", "OFFER", "CONTRACT", "PAYMENT"].map((t) => (
                <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input name="content" placeholder="Log an update..." className={inputClass} />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Log
            </button>
          </form>
          <div className="space-y-3">
            {deal.activities.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
            {deal.activities.map((activity) => (
              <div key={activity.id} className="flex gap-3 border-l-2 border-slate-200 pl-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-400">
                    <Badge color={ACTIVITY_COLORS[activity.type] ?? "slate"}>{activity.type.replaceAll("_", " ")}</Badge>{" "}
                    <span className="ml-1">{activity.author?.name ?? "System"} · {activity.createdAt.toLocaleString()}</span>
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{activity.content}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Tasks</SectionTitle>
          <form action={createTaskForEntity} className="mb-4 flex gap-2">
            <input type="hidden" name="dealId" value={deal.id} />
            <input name="title" placeholder="Task..." className={inputClass} required />
            <input name="dueDate" type="date" className={inputClass + " w-40"} />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {deal.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
            {deal.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm">
                <span>{task.title}</span>
                <Badge color={task.status === "COMPLETED" ? "green" : "amber"} dot>{task.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <SectionTitle>Transaction Stage</SectionTitle>
          <form action={async (formData) => { "use server"; await updateDealStage(deal.id, formData.get("stage") as never); }}>
            <AutoSubmitSelect name="stage" defaultValue={deal.stage} className={inputClass}>
              {DEAL_STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </AutoSubmitSelect>
          </form>
        </Card>

        {deal.agent && (
          <Card className="p-6">
            <SectionTitle>Assigned Agent</SectionTitle>
            <div className="flex items-center gap-3">
              <Avatar name={deal.agent.name} size="lg" />
              <div>
                <p className="text-sm font-medium text-slate-900">{deal.agent.name}</p>
                <p className="text-xs text-slate-400">Agent</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
