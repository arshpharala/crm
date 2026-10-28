import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Badge, Card, LinkButton, PageHeader, PersonChip, SectionTitle, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { CalendarIcon } from "@/components/icons";
import { addLeadActivity, assignLead, convertLeadToContact, updateLeadStage } from "../actions";
import { createTaskForEntity } from "../../tasks/actions";
import { canEditLead, canEditAnyLead, assignableAgentsWhere } from "@/lib/permissions";
import { EditLeadDetails } from "./edit-lead-details";

const STAGES = [
  "NEW", "UNASSIGNED", "ASSIGNED", "FIRST_CONTACT_PENDING", "CONTACT_ATTEMPTED", "CONTACTED",
  "QUALIFIED", "REQUIREMENTS_COLLECTED", "PROPERTIES_SHORTLISTED", "PROPOSAL_SENT",
  "FOLLOW_UP_PENDING", "VIEWING_SCHEDULED", "VIEWING_COMPLETED", "NEGOTIATION",
  "BOOKING_IN_PROGRESS", "BOOKING_COMPLETED", "SPA_CONTRACT_PROCESSING", "TRANSACTION_COMPLETED",
  "AFTER_SALES", "NURTURING", "LOST", "DUPLICATE", "INVALID",
];

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  const sessionUser = userId
    ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, teamId: true } })
    : null;

  const [lead, agents] = await Promise.all([
    prisma.lead.findUnique({
      where: { id },
      include: {
        assignedAgent: true,
        createdBy: { select: { id: true, name: true } },
        activities: { orderBy: { createdAt: "desc" }, include: { author: true } },
        tasks: { orderBy: { dueDate: "asc" } },
      },
    }),
    prisma.user.findMany({
      where: sessionUser ? assignableAgentsWhere(sessionUser) : { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!lead) notFound();

  // Permission: can this user edit lead details?
  const hasEditPermission = userRole
    ? canEditAnyLead(userRole) ||
      (canEditLead(userRole) && lead.assignedAgentId === userId)
    : false;

  // Is the current user an "own"-scope agent?
  const isAgentScope = userRole ? (
    ["AGENT", "TELECALLER", "REFERRAL_PARTNER"].includes(userRole)
  ) : false;
  const isAssignedToSelf = lead.assignedAgentId === userId;

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

        {/* Lead Details — editable for authorised roles, read-only for others */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Lead Details</SectionTitle>
            {!hasEditPermission && (
              <span className="text-xs text-slate-400">Read-only</span>
            )}
          </div>

          {hasEditPermission ? (
            <EditLeadDetails lead={lead} />
          ) : (
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Phone</p><p className="font-medium text-slate-900">{lead.phone}</p></div>
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Email</p><p className="font-medium text-slate-900">{lead.email ?? "-"}</p></div>
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Country</p><p className="font-medium text-slate-900">{lead.country ?? "-"}</p></div>
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Source</p><p className="font-medium text-slate-900">{lead.source.replaceAll("_", " ")}</p></div>
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Interest</p><p className="font-medium text-slate-900">{lead.propertyInterest ?? "-"}</p></div>
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Budget</p><p className="font-medium text-slate-900">{lead.currency} {lead.budgetMin ?? "?"} – {lead.budgetMax ?? "?"}</p></div>
              <div><p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Purpose</p><p className="font-medium text-slate-900">{lead.purpose?.replaceAll("_", " ") ?? "-"}</p></div>
            </div>
          )}
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
          {lead.assignedAgent ? (
            <div className="mb-3">
              <PersonChip name={lead.assignedAgent.name} />
            </div>
          ) : (
            <p className="mb-3 text-sm text-slate-400">Unassigned</p>
          )}

          {/* Admins / managers: full dropdown */}
          {!isAgentScope && (
            <form action={async (formData) => { "use server"; await assignLead(lead.id, formData.get("agentId") as string); }}>
              <AutoSubmitSelect name="agentId" defaultValue={lead.assignedAgentId ?? ""} className={inputClass}>
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>{agent.name}</option>
                ))}
              </AutoSubmitSelect>
            </form>
          )}

          {/* Agents: can only assign to themselves or unassign themselves */}
          {isAgentScope && (
            <div className="space-y-2">
              {!isAssignedToSelf ? (
                <form action={async () => { "use server"; await assignLead(lead.id, userId!); }}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    Assign to Me
                  </button>
                </form>
              ) : (
                <form action={async () => { "use server"; await assignLead(lead.id, ""); }}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Unassign Myself
                  </button>
                </form>
              )}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <SectionTitle>Lead Quality</SectionTitle>
          <Badge color={lead.temperature === "HOT" ? "red" : lead.temperature === "WARM" ? "amber" : "blue"} dot>
            {lead.temperature}
          </Badge>
        </Card>

        <Card className="p-6">
          <SectionTitle>Lead Info</SectionTitle>
          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">Created By</p>
              <p className="font-medium text-slate-900">
                {lead.createdBy?.name ?? <span className="text-slate-400">—</span>}
              </p>
            </div>
            <div>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">Created At</p>
              <p className="font-medium text-slate-900">{lead.createdAt.toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">Source</p>
              <p className="font-medium text-slate-900">{lead.source.replaceAll("_", " ")}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
