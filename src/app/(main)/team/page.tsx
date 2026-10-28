import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageTeam } from "@/lib/permissions";
import { assignLead } from "../leads/actions";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  PersonChip,
  SectionTitle,
  Td,
  Th,
  TableShell,
  inputClass,
} from "@/components/ui";
import { TargetIcon, UsersGroupIcon } from "@/components/icons";

const TEMP_COLORS: Record<string, string> = { HOT: "red", WARM: "amber", COLD: "blue" };

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user || !canManageTeam(session.user.role)) {
    return (
      <div>
        <PageHeader title="My Team" />
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">
            This page is for Team Leaders and Sales Managers to manage their own team.
          </p>
        </Card>
      </div>
    );
  }

  const team = await prisma.team.findFirst({
    where: { leaderId: session.user.id },
    include: { members: { orderBy: { name: "asc" } } },
  });

  if (!team) {
    return (
      <div>
        <PageHeader title="My Team" />
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">
            You haven&apos;t been set as the leader of a team yet. Ask an admin to assign you as a team
            leader from the Users page.
          </p>
        </Card>
      </div>
    );
  }

  const memberIds = team.members.map((m) => m.id);

  const [leadCounts, teamLeads] = await Promise.all([
    prisma.lead.groupBy({
      by: ["assignedAgentId"],
      where: { assignedAgentId: { in: memberIds } },
      _count: { _all: true },
    }),
    prisma.lead.findMany({
      where: { OR: [{ assignedAgentId: { in: memberIds } }, { assignedAgentId: null }] },
      orderBy: { createdAt: "desc" },
      include: { assignedAgent: true },
      take: 100,
    }),
  ]);

  const countByAgent = new Map(leadCounts.map((c) => [c.assignedAgentId, c._count._all]));

  return (
    <div className="space-y-6">
      <PageHeader title={team.name} subtitle={`${team.members.length} member${team.members.length === 1 ? "" : "s"}`} />

      <Card className="p-6">
        <SectionTitle>Team Roster</SectionTitle>
        {team.members.length === 0 ? (
          <EmptyState message="No members in this team yet." icon={<UsersGroupIcon size={28} />} />
        ) : (
          <TableShell>
            <thead className="border-b border-slate-100">
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Email</Th>
                <Th>Open Leads</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80">
                  <Td><PersonChip name={m.name} /></Td>
                  <Td className="text-slate-600">{m.role.replaceAll("_", " ")}</Td>
                  <Td className="text-slate-600">{m.email}</Td>
                  <Td className="text-slate-600">{countByAgent.get(m.id) ?? 0}</Td>
                  <Td>
                    <Badge color={m.active ? "green" : "slate"} dot>{m.active ? "Active" : "Inactive"}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>

      <Card className="p-6">
        <SectionTitle>Team Leads</SectionTitle>
        <p className="mb-4 text-sm text-slate-500">
          Leads already assigned to your team, plus the shared unassigned pool. Reassign any of them to a
          team member below.
        </p>
        {teamLeads.length === 0 ? (
          <EmptyState message="No leads to show yet." icon={<TargetIcon size={28} />} />
        ) : (
          <TableShell>
            <thead className="border-b border-slate-100">
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Stage</Th>
                <Th>Temp</Th>
                <Th>Assign To</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80">
                  <Td>
                    <Link href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                      {lead.fullName}
                    </Link>
                  </Td>
                  <Td className="text-slate-600">{lead.phone}</Td>
                  <Td><Badge>{lead.stage.replaceAll("_", " ")}</Badge></Td>
                  <Td><Badge color={TEMP_COLORS[lead.temperature]} dot>{lead.temperature}</Badge></Td>
                  <Td>
                    <form action={async (formData) => { "use server"; await assignLead(lead.id, formData.get("agentId") as string); }}>
                      <AutoSubmitSelect name="agentId" defaultValue={lead.assignedAgentId ?? ""} className={inputClass + " w-44"}>
                        <option value="">Unassigned</option>
                        {team.members.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </AutoSubmitSelect>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
