import { prisma } from "@/lib/prisma";
import { EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { DealBoard, type BoardDeal } from "./board";

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: true, property: true, agent: true },
  });

  const boardDeals: BoardDeal[] = deals.map((deal) => ({
    id: deal.id,
    title: deal.title,
    stage: deal.stage,
    value: deal.value,
    currency: deal.currency,
    contactName: deal.contact.fullName,
    propertyTitle: deal.property?.title ?? null,
    agentName: deal.agent?.name ?? null,
  }));

  const totalPipelineValue = deals
    .filter((d) => d.stage !== "CLOSED_WON" && d.stage !== "CLOSED_LOST")
    .reduce((sum, d) => sum + (d.value ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Deals Pipeline"
        subtitle={`AED ${totalPipelineValue.toLocaleString()} in active pipeline`}
        action={
          <LinkButton href="/deals/new">
            <PlusIcon size={16} /> New Deal
          </LinkButton>
        }
      />

      {deals.length === 0 ? (
        <EmptyState message="No deals yet. Create your first deal to start the pipeline." />
      ) : (
        <DealBoard deals={boardDeals} />
      )}
    </div>
  );
}
