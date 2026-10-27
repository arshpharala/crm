import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { addDealActivity, updateDealStage } from "../actions";
import { createTaskForEntity } from "../../tasks/actions";

const STAGES: { value: string; label: string }[] = [
  { value: "QUALIFICATION", label: "Qualification" },
  { value: "PROPERTY_SELECTION", label: "Property Selection" },
  { value: "VIEWING", label: "Viewing" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "BOOKING", label: "Booking" },
  { value: "SPA_PROCESSING", label: "SPA / Contract Processing" },
  { value: "TRANSFER_DLD", label: "DLD Transfer" },
  { value: "COMMISSION", label: "Commission" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
];

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
        <PageHeader title={deal.title} />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-slate-500">Contact:</span> <Link href={`/contacts/${deal.contact.id}`} className="font-medium hover:underline">{deal.contact.fullName}</Link></div>
            <div><span className="text-slate-500">Property:</span> <span className="font-medium">{deal.property ? <Link href={`/properties/${deal.property.id}`} className="hover:underline">{deal.property.title}</Link> : "-"}</span></div>
            <div><span className="text-slate-500">Type:</span> <span className="font-medium">{deal.type.replaceAll("_", " ")}</span></div>
            <div><span className="text-slate-500">Value:</span> <span className="font-medium">{deal.value ? `${deal.currency} ${deal.value.toLocaleString()}` : "-"}</span></div>
            <div><span className="text-slate-500">Agent:</span> <span className="font-medium">{deal.agent?.name ?? "-"}</span></div>
            <div><span className="text-slate-500">Commission:</span> <span className="font-medium">{deal.commissionAmount ? `${deal.currency} ${deal.commissionAmount}` : "-"}</span></div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Activity Timeline</h2>
          <form action={addDealActivity} className="mb-4 flex gap-2">
            <input type="hidden" name="dealId" value={deal.id} />
            <select name="type" className={inputClass + " w-40"} defaultValue="NOTE">
              {["CALL", "WHATSAPP", "EMAIL", "MEETING", "NOTE", "OFFER", "CONTRACT", "PAYMENT"].map((t) => (
                <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input name="content" placeholder="Log an update..." className={inputClass} />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Log
            </button>
          </form>
          <div className="space-y-3">
            {deal.activities.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
            {deal.activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-slate-200 pl-3">
                <p className="text-xs text-slate-400">
                  {activity.type.replaceAll("_", " ")} · {activity.author?.name ?? "System"} · {activity.createdAt.toLocaleString()}
                </p>
                <p className="text-sm text-slate-700">{activity.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Tasks</h2>
          <form action={createTaskForEntity} className="mb-4 flex gap-2">
            <input type="hidden" name="dealId" value={deal.id} />
            <input name="title" placeholder="Task..." className={inputClass} required />
            <input name="dueDate" type="date" className={inputClass + " w-40"} />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {deal.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
            {deal.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2 text-sm">
                <span>{task.title}</span>
                <Badge color={task.status === "COMPLETED" ? "green" : "amber"}>{task.status.replaceAll("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Transaction Stage</h2>
          <form action={async (formData) => { "use server"; await updateDealStage(deal.id, formData.get("stage") as never); }}>
            <AutoSubmitSelect name="stage" defaultValue={deal.stage} className={inputClass}>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </AutoSubmitSelect>
          </form>
        </Card>
      </div>
    </div>
  );
}
