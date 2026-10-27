"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DEAL_STAGES } from "@/lib/constants";
import { Avatar, Badge, Card } from "@/components/ui";
import { updateDealStage } from "./actions";

export type BoardDeal = {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  currency: string;
  contactName: string;
  propertyTitle: string | null;
  agentName: string | null;
};

export function DealBoard({ deals }: { deals: BoardDeal[] }) {
  const [items, setItems] = useState(deals);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function handleDrop(stage: string) {
    if (!dragId) return;
    const dealId = dragId;
    setDragId(null);

    setItems((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)));

    startTransition(async () => {
      await updateDealStage(dealId, stage as never);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {DEAL_STAGES.map((stage) => {
        const stageDeals = items.filter((d) => d.stage === stage.value);
        const stageValue = stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);

        return (
          <div
            key={stage.value}
            className="w-72 shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(stage.value)}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stage.label} <span className="text-slate-400">({stageDeals.length})</span>
              </p>
            </div>
            {stageValue > 0 && (
              <p className="mb-2 px-1 text-xs text-slate-400">AED {stageValue.toLocaleString()}</p>
            )}

            <div className="min-h-[60px] space-y-2 rounded-xl bg-slate-100/70 p-2">
              {stageDeals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => setDragId(deal.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => router.push(`/deals/${deal.id}`)}
                >
                  <Card className={`cursor-grab p-3 transition-shadow hover:shadow-md active:cursor-grabbing ${dragId === deal.id ? "opacity-50" : ""}`}>
                    <p className="text-sm font-medium text-slate-900">{deal.title}</p>
                    {deal.propertyTitle && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">{deal.propertyTitle}</p>
                    )}
                    <div className="mt-2.5 flex items-center justify-between">
                      <Badge color="slate">{deal.contactName}</Badge>
                      {deal.agentName && <Avatar name={deal.agentName} size="sm" />}
                    </div>
                    {deal.value != null && (
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {deal.currency} {deal.value.toLocaleString()}
                      </p>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
