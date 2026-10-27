import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

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
        action={
          <Link
            href="/leads/new"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + New Lead
          </Link>
        }
      />

      {leads.length === 0 ? (
        <EmptyState message="No leads yet. Add your first lead to get started." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Temp</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:underline">
                      {lead.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{lead.source.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3">
                    <Badge>{lead.stage.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={TEMP_COLORS[lead.temperature]}>{lead.temperature}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.assignedAgent?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.budgetMin || lead.budgetMax
                      ? `${lead.currency} ${lead.budgetMin ?? "?"} - ${lead.budgetMax ?? "?"}`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
