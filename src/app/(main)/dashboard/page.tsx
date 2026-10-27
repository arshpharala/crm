import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, PersonChip, StatCard } from "@/components/ui";
import { TargetIcon, FlameIcon, UserIcon, BriefcaseIcon, CheckSquareIcon, BuildingIcon, ClockIcon } from "@/components/icons";

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
    recentLeads,
    upcomingTasks,
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
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { assignedAgent: true },
    }),
    prisma.task.findMany({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { assignee: true },
    }),
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
    recentLeads,
    upcomingTasks,
  };
}

const TEMP_COLORS: Record<string, string> = { HOT: "red", WARM: "amber", COLD: "blue" };

export default async function DashboardPage() {
  const stats = await getStats();
  const now = new Date();

  return (
    <div>
      <PageHeader title="Executive Dashboard" subtitle="Live snapshot of leads, pipeline and team activity" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Leads" value={stats.totalLeads} icon={<TargetIcon size={18} />} accent="indigo" />
        <StatCard label="Hot Leads" value={stats.hotLeads} icon={<FlameIcon size={18} />} accent="rose" />
        <StatCard label="Unassigned Leads" value={stats.unassignedLeads} icon={<UserIcon size={18} />} accent="amber" />
        <StatCard label="New Today" value={stats.newLeadsToday} icon={<TargetIcon size={18} />} accent="blue" />
        <StatCard label="Open Deals" value={stats.openDeals} icon={<BriefcaseIcon size={18} />} accent="indigo" />
        <StatCard label="Closed Won" value={stats.closedDeals} icon={<BriefcaseIcon size={18} />} accent="emerald" />
        <StatCard label="Overdue Follow-ups" value={stats.overdueFollowUps} icon={<ClockIcon size={18} />} accent="rose" />
        <StatCard label="Properties Listed" value={stats.totalProperties} icon={<BuildingIcon size={18} />} accent="blue" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Leads</h2>
            <Link href="/leads" className="text-xs font-medium text-indigo-600 hover:underline">View all</Link>
          </div>
          {stats.recentLeads.length === 0 ? (
            <p className="text-sm text-slate-400">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50"
                >
                  <PersonChip name={lead.fullName} />
                  <Badge color={TEMP_COLORS[lead.temperature]} dot>{lead.temperature}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-xs font-medium text-indigo-600 hover:underline">View all</Link>
          </div>
          {stats.upcomingTasks.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing scheduled.</p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingTasks.map((task) => {
                const overdue = task.dueDate && task.dueDate < now;
                return (
                  <div key={task.id} className="flex items-center justify-between rounded-lg px-2 py-2">
                    <div className="flex items-center gap-2.5">
                      <CheckSquareIcon size={16} className={overdue ? "text-rose-500" : "text-slate-300"} />
                      <span className="text-sm text-slate-700">{task.title}</span>
                    </div>
                    <span className={`text-xs ${overdue ? "font-medium text-rose-600" : "text-slate-400"}`}>
                      {task.dueDate?.toLocaleDateString() ?? "No date"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
