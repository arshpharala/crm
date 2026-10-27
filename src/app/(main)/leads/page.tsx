import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, EmptyState, LinkButton, PageHeader, PersonChip, Td, Th, TableShell } from "@/components/ui";
import { PlusIcon, TargetIcon } from "@/components/icons";

const TEMP_COLORS: Record<string, string> = { HOT: "red", WARM: "amber", COLD: "blue" };

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { assignedAgent: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle={`${leads.length} total`}
        action={
          <LinkButton href="/leads/new">
            <PlusIcon size={16} /> New Lead
          </LinkButton>
        }
      />

      {leads.length === 0 ? (
        <EmptyState message="No leads yet. Add your first lead to get started." icon={<TargetIcon size={28} />} />
      ) : (
        <TableShell>
          <thead className="border-b border-slate-100">
            <tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Source</Th>
              <Th>Stage</Th>
              <Th>Temp</Th>
              <Th>Agent</Th>
              <Th>Budget</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/80">
                <Td>
                  <Link href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {lead.fullName}
                  </Link>
                </Td>
                <Td className="text-slate-600">{lead.phone}</Td>
                <Td className="text-slate-600">{lead.source.replaceAll("_", " ")}</Td>
                <Td><Badge>{lead.stage.replaceAll("_", " ")}</Badge></Td>
                <Td><Badge color={TEMP_COLORS[lead.temperature]} dot>{lead.temperature}</Badge></Td>
                <Td>{lead.assignedAgent ? <PersonChip name={lead.assignedAgent.name} /> : <span className="text-slate-400">Unassigned</span>}</Td>
                <Td className="text-slate-600">
                  {lead.budgetMin || lead.budgetMax
                    ? `${lead.currency} ${lead.budgetMin ?? "?"} - ${lead.budgetMax ?? "?"}`
                    : "-"}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
