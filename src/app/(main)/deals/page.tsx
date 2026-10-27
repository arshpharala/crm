import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";

const STAGE_COLORS: Record<string, string> = {
  CLOSED_WON: "green",
  CLOSED_LOST: "red",
};

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: true, property: true, agent: true },
  });

  return (
    <div>
      <PageHeader
        title="Deals Pipeline"
        action={
          <Link href="/deals/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            + New Deal
          </Link>
        }
      />

      {deals.length === 0 ? (
        <EmptyState message="No deals yet." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/deals/${deal.id}`} className="font-medium text-slate-900 hover:underline">
                      {deal.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{deal.contact.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{deal.property?.title ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{deal.agent?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{deal.value ? `${deal.currency} ${deal.value.toLocaleString()}` : "-"}</td>
                  <td className="px-4 py-3">
                    <Badge color={STAGE_COLORS[deal.stage] ?? "slate"}>{deal.stage.replaceAll("_", " ")}</Badge>
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
