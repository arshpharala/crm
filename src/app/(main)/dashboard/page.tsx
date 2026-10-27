import { prisma } from "@/lib/prisma";
import { Card, PageHeader } from "@/components/ui";

async function getStats() {
  const [
    totalLeads,
    newLeadsToday,
    unassignedLeads,
    hotLeads,
    overdueFollowUps,
    openDeals,
    closedDeals,
    totalProperties,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: { createdAt: { gte: new Date(new Date().toDateString()) } },
    }),
    prisma.lead.count({ where: { assignedAgentId: null } }),
    prisma.lead.count({ where: { temperature: "HOT" } }),
    prisma.task.count({
      where: { status: "PENDING", dueDate: { lt: new Date() } },
    }),
    prisma.deal.count({ where: { stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } } }),
    prisma.deal.count({ where: { stage: "CLOSED_WON" } }),
    prisma.property.count(),
  ]);

  return {
    totalLeads,
    newLeadsToday,
    unassignedLeads,
    hotLeads,
    overdueFollowUps,
    openDeals,
    closedDeals,
    totalProperties,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const tiles = [
    { label: "Total Leads", value: stats.totalLeads },
    { label: "New Leads Today", value: stats.newLeadsToday },
    { label: "Unassigned Leads", value: stats.unassignedLeads },
    { label: "Hot Leads", value: stats.hotLeads },
    { label: "Overdue Follow-ups", value: stats.overdueFollowUps },
    { label: "Open Deals", value: stats.openDeals },
    { label: "Closed Won Deals", value: stats.closedDeals },
    { label: "Properties Listed", value: stats.totalProperties },
  ];

  return (
    <div>
      <PageHeader title="Executive Dashboard" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((tile) => (
          <Card key={tile.label} className="p-5">
            <p className="text-sm text-slate-500">{tile.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{tile.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
