import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar, Badge, EmptyState, PageHeader, Td, Th, TableShell } from "@/components/ui";
import { MessageIcon } from "@/components/icons";
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
      <PageHeader title="WhatsApp Inbox" subtitle={`${conversations.length} conversations`} />

      {!configured && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          WhatsApp isn&apos;t configured yet.{" "}
          <a href="/settings/integrations" className="font-medium underline">See setup steps</a>.
        </div>
      )}

      {conversations.length === 0 ? (
        <EmptyState message="No conversations yet. Inbound messages will appear here automatically." icon={<MessageIcon size={28} />} />
      ) : (
        <TableShell>
          <thead className="border-b border-slate-100">
            <tr>
              <Th>Contact</Th>
              <Th>Last Message</Th>
              <Th>Related</Th>
              <Th>Agent</Th>
              <Th>Status</Th>
              <Th>When</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {conversations.map((conversation) => (
              <tr key={conversation.id} className="hover:bg-slate-50/80">
                <Td>
                  <Link href={`/whatsapp/${conversation.id}`} className="flex items-center gap-2.5">
                    <Avatar name={conversation.displayName ?? conversation.phoneNumber} size="sm" />
                    <div>
                      <p className="font-medium text-slate-900">{conversation.displayName ?? conversation.phoneNumber}</p>
                      <p className="text-xs text-slate-400">{conversation.phoneNumber}</p>
                    </div>
                  </Link>
                </Td>
                <Td className="max-w-xs truncate text-slate-600">{conversation.messages[0]?.content ?? "-"}</Td>
                <Td className="text-slate-600">{conversation.lead?.fullName ?? conversation.contact?.fullName ?? "-"}</Td>
                <Td className="text-slate-600">{conversation.assignedAgent?.name ?? "Unassigned"}</Td>
                <Td><Badge color={STATUS_COLORS[conversation.status]} dot>{conversation.status}</Badge></Td>
                <Td className="text-slate-600">{conversation.lastMessageAt.toLocaleString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
