import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "green",
  PENDING: "amber",
  CLOSED: "slate",
};

export default async function WhatsAppInboxPage() {
  const configured = isWhatsAppConfigured();

  const conversations = await prisma.whatsAppConversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { assignedAgent: true, lead: true, contact: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div>
      <PageHeader title="WhatsApp Inbox" />

      {!configured && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          WhatsApp isn&apos;t configured yet.{" "}
          <a href="/settings/integrations" className="font-medium underline">See setup steps</a>.
        </div>
      )}

      {conversations.length === 0 ? (
        <EmptyState message="No conversations yet. Inbound messages will appear here automatically." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Last Message</th>
                <th className="px-4 py-3">Related</th>
                <th className="px-4 py-3">Agent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {conversations.map((conversation) => (
                <tr key={conversation.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/whatsapp/${conversation.id}`} className="font-medium text-slate-900 hover:underline">
                      {conversation.displayName ?? conversation.phoneNumber}
                    </Link>
                    <p className="text-xs text-slate-400">{conversation.phoneNumber}</p>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                    {conversation.messages[0]?.content ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {conversation.lead?.fullName ?? conversation.contact?.fullName ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{conversation.assignedAgent?.name ?? "Unassigned"}</td>
                  <td className="px-4 py-3">
                    <Badge color={STATUS_COLORS[conversation.status]}>{conversation.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{conversation.lastMessageAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
