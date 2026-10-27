import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge, Card, PageHeader, inputClass } from "@/components/ui";
import { AutoSubmitSelect } from "@/components/auto-submit-select";
import { assignConversation, sendReply, tagConversation, updateConversationStatus } from "../actions";

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [conversation, agents] = await Promise.all([
    prisma.whatsAppConversation.findUnique({
      where: { id },
      include: {
        assignedAgent: true,
        lead: true,
        contact: true,
        messages: { orderBy: { createdAt: "asc" }, include: { author: true } },
      },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!conversation) notFound();

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <PageHeader title={conversation.displayName ?? conversation.phoneNumber} />

        <Card className="flex h-[520px] flex-col p-6">
          <div className="flex-1 space-y-3 overflow-y-auto">
            {conversation.messages.length === 0 && (
              <p className="text-sm text-slate-400">No messages yet.</p>
            )}
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  message.direction === "OUTBOUND"
                    ? "ml-auto bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p>{message.content}</p>
                <p className={`mt-1 text-[10px] ${message.direction === "OUTBOUND" ? "text-slate-300" : "text-slate-400"}`}>
                  {message.direction === "OUTBOUND" ? message.author?.name ?? "Agent" : "Client"} ·{" "}
                  {message.createdAt.toLocaleString()} · {message.status}
                </p>
              </div>
            ))}
          </div>

          <form action={sendReply} className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
            <input type="hidden" name="conversationId" value={conversation.id} />
            <input name="content" placeholder="Type a reply..." className={inputClass} required />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              Send
            </button>
          </form>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Linked Record</h2>
          {conversation.lead && (
            <Link href={`/leads/${conversation.lead.id}`} className="text-sm text-slate-700 hover:underline">
              Lead: {conversation.lead.fullName}
            </Link>
          )}
          {conversation.contact && (
            <Link href={`/contacts/${conversation.contact.id}`} className="text-sm text-slate-700 hover:underline">
              Contact: {conversation.contact.fullName}
            </Link>
          )}
          {!conversation.lead && !conversation.contact && (
            <p className="text-sm text-slate-400">No linked record.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Status</h2>
          <form action={async (formData) => { "use server"; await updateConversationStatus(conversation.id, formData.get("status") as never); }}>
            <AutoSubmitSelect name="status" defaultValue={conversation.status} className={inputClass}>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="CLOSED">Closed</option>
            </AutoSubmitSelect>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Assigned Agent</h2>
          <form action={assignConversation}>
            <input type="hidden" name="conversationId" value={conversation.id} />
            <AutoSubmitSelect name="agentId" defaultValue={conversation.assignedAgentId ?? ""} className={inputClass}>
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </AutoSubmitSelect>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Tags</h2>
          <form action={tagConversation} className="flex gap-2">
            <input type="hidden" name="conversationId" value={conversation.id} />
            <input
              name="tags"
              defaultValue={conversation.tags ?? ""}
              placeholder="hot-lead, marina, investor..."
              className={inputClass}
            />
            <button className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
              Save
            </button>
          </form>
          {conversation.tags && (
            <div className="mt-2 flex flex-wrap gap-1">
              {conversation.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
