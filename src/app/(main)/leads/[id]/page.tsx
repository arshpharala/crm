import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge, Card, LinkButton, PageHeader, PersonChip, SectionTitle, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { CalendarIcon } from "@/components/icons";
import { addLeadActivity, assignLead, convertLeadToContact, updateLeadStage } from "../actions";
import { createTaskForEntity } from "../../tasks/actions";

const STAGES = [
  "NEW", "UNASSIGNED", "ASSIGNED", "FIRST_CONTACT_PENDING", "CONTACT_ATTEMPTED", "CONTACTED",
  "QUALIFIED", "REQUIREMENTS_COLLECTED", "PROPERTIES_SHORTLISTED", "PROPOSAL_SENT",
  "FOLLOW_UP_PENDING", "VIEWING_SCHEDULED", "VIEWING_COMPLETED", "NEGOTIATION",
  "BOOKING_IN_PROGRESS", "BOOKING_COMPLETED", "SPA_CONTRACT_PROCESSING", "TRANSACTION_COMPLETED",
  "AFTER_SALES", "NURTURING", "LOST", "DUPLICATE", "INVALID",
];

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [lead, agents] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        assignedAgent: true,
        activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
        tasks: { orderBy: { dueDate: "asc" } },
      },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!lead) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader
          title={lead.fullName}
          subtitle={lead.phone}
          action={
            <div className="flex items-center gap-3">
              <LinkButton href={`/meetings/new?leadId=${lead.id}`} variant="secondary">
                <CalendarIcon size={16} /> Schedule Meeting
              </LinkButton>
              {!lead.convertedContactId ? (
                <form action={async () => { "use server"; await convertLeadToContact(lead.id); }}>
                  <button className="rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                    Convert to Contact
                  </button>
                </form>
              ) : (
                <Badge color="green">Converted to Contact</Badge>
              )}
            </div>
          }
        />

        <Card className="p-6">
          <div className="grid grid-cols-2 gap-5 text-sm">
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Phone</p><p className="font-medium text-slate-900">{lead.phone}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Email</p><p className="font-medium text-slate-900">{lead.email ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Country</p><p className="font-medium text-slate-900">{lead.country ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Source</p><p className="font-medium text-slate-900">{lead.source.replaceAll("_", " ")}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Interest</p><p className="font-medium text-slate-900">{lead.propertyInterest ?? "-"}</p></div>
            <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Budget</p><p className="font-medium text-slate-900">{lead.currency} {lead.budgetMin ?? "?"} - {lead.budgetMax ?? "?"}</p></div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle>Activity Timeline</SectionTitle>
          <form action={addLeadActivity} className="mb-4 flex gap-2">
            <input type="hidden" name="leadId" value={lead.id} />
            <select name="type" className={inputClass + " w-40"} defaultValue="NOTE">
              {["CALL", "WHATSAPP", "EMAIL", "SMS", "MEETING", "NOTE", "BROCHURE_SENT", "QUOTATION", "VIEWING", "FOLLOW_UP"].map((t) => (
                <option key={t} value={t}>{t.replaceAll("_", " ")}</option>
              ))}
            </select>
            <input name="content" placeholder="Log a call, message, note..." className={inputClass} />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Log
            </button>
          </form>

          <div className="space-y-3">
            {lead.activities.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
            {lead.activities.map((activity) => (
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
            <input type="hidden" name="leadId" value={lead.id} />
            <input name="title" placeholder="Follow-up task..." className={inputClass} required />
            <input name="dueDate" type="date" className={inputClass + " w-40"} />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Add
            </button>
          </form>
          <div className="space-y-2">
            {lead.tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
            {lead.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5 text-sm">
                <span>{task.title}</span>
                <div className="flex items-center gap-2">
                  {task.dueDate && <span className="text-xs text-slate-400">{task.dueDate.toLocaleDateString()}</span>}
                  <Badge color={task.status === "COMPLETED" ? "green" : "amber"} dot>{task.status.replaceAll("_", " ")}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <SectionTitle>Pipeline Stage</SectionTitle>
          <form action={async (formData) => { "use server"; await updateLeadStage(lead.id, formData.get("stage") as never); }}>
            <AutoSubmitSelect name="stage" defaultValue={lead.stage} className={inputClass}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </AutoSubmitSelect>
          </form>
        </Card>

        <Card className="p-6">
          <SectionTitle>Assigned Agent</SectionTitle>
          {lead.assignedAgent && (
            <div className="mb-3">
              <PersonChip name={lead.assignedAgent.name} />
            </div>
          )}
          <form action={async (formData) => { "use server"; await assignLead(lead.id, formData.get("agentId") as string); }}>
            <AutoSubmitSelect name="agentId" defaultValue={lead.assignedAgentId ?? ""} className={inputClass}>
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </AutoSubmitSelect>
          </form>
        </Card>

        <Card className="p-6">
          <SectionTitle>Lead Quality</SectionTitle>
          <Badge color={lead.temperature === "HOT" ? "red" : lead.temperature === "WARM" ? "amber" : "blue"} dot>
            {lead.temperature}
          </Badge>
        </Card>
      </div>
    </div>
  );
}
