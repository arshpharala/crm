"use server";

import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getAnthropicClient, isAIConfigured, AI_MODEL } from "@/lib/ai";
import { can } from "@/lib/permissions";
import type { Role } from "@prisma/client";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type ScopedUser = { id: string; name: string; role: Role; teamId: string | null };

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_leads",
    description: "Search CRM leads by name or phone, optionally filtered by stage. Returns up to 15 matches.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text to match against lead name or phone (optional)" },
        stage: { type: "string", description: "Exact lead stage, e.g. NEW, QUALIFIED, NEGOTIATION, LOST (optional)" },
      },
    },
  },
  {
    name: "get_lead",
    description: "Get full details for one lead by its id, including recent activity log entries.",
    input_schema: {
      type: "object",
      properties: { leadId: { type: "string" } },
      required: ["leadId"],
    },
  },
  {
    name: "search_properties",
    description: "Search available property inventory.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", description: "OFF_PLAN, SECONDARY_SALE, LEASING_RESIDENTIAL, or LEASING_COMMERCIAL (optional)" },
        community: { type: "string", description: "Community or area name, partial match (optional)" },
        minPrice: { type: "number" },
        maxPrice: { type: "number" },
        bedrooms: { type: "number" },
      },
    },
  },
  {
    name: "search_deals",
    description: "Search the CRM deals pipeline, optionally by stage.",
    input_schema: {
      type: "object",
      properties: { stage: { type: "string", description: "Exact deal stage, e.g. QUALIFICATION, NEGOTIATION, CLOSED_WON (optional)" } },
    },
  },
  {
    name: "search_developers",
    description: "Search developer/partner records and their projects by developer name.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
    },
  },
];

async function executeTool(name: string, input: Record<string, unknown>, user: ScopedUser) {
  try {
    switch (name) {
      case "search_leads": {
        const scope = can(user.role, "leads");
        if (scope === "none") return { error: "You don't have access to leads." };

        const and: object[] = [];
        if (typeof input.query === "string" && input.query) {
          and.push({ OR: [{ fullName: { contains: input.query } }, { phone: { contains: input.query } }] });
        }
        if (typeof input.stage === "string" && input.stage) and.push({ stage: input.stage });
        if (scope === "own") and.push({ assignedAgentId: user.id });
        if (scope === "team") {
          and.push(
            user.teamId
              ? { OR: [{ assignedAgent: { teamId: user.teamId } }, { assignedAgentId: null }] }
              : { assignedAgentId: user.id }
          );
        }

        const leads = await prisma.lead.findMany({
          where: and.length ? { AND: and } : {},
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, fullName: true, phone: true, stage: true, temperature: true,
            budgetMin: true, budgetMax: true, currency: true, propertyInterest: true,
            assignedAgent: { select: { name: true } },
          },
        });
        return { leads };
      }

      case "get_lead": {
        const scope = can(user.role, "leads");
        if (scope === "none") return { error: "You don't have access to leads." };
        const leadId = String(input.leadId ?? "");
        const lead = await prisma.lead.findUnique({
          where: { id: leadId },
          include: {
            assignedAgent: { select: { name: true, teamId: true } },
            activities: { orderBy: { createdAt: "desc" }, take: 5, select: { type: true, content: true, createdAt: true } },
          },
        });
        if (!lead) return { error: "Lead not found." };
        if (scope === "own" && lead.assignedAgentId !== user.id) return { error: "You don't have access to this lead." };
        if (scope === "team" && lead.assignedAgentId && lead.assignedAgent?.teamId !== user.teamId) {
          return { error: "You don't have access to this lead." };
        }
        return { lead };
      }

      case "search_properties": {
        const scope = can(user.role, "properties");
        if (scope === "none") return { error: "You don't have access to properties." };

        const where: Record<string, unknown> = { availability: "AVAILABLE" };
        if (typeof input.category === "string" && input.category) where.category = input.category;
        if (typeof input.community === "string" && input.community) where.community = { contains: input.community };
        if (typeof input.bedrooms === "number") where.bedrooms = input.bedrooms;
        if (typeof input.minPrice === "number" || typeof input.maxPrice === "number") {
          where.price = {
            ...(typeof input.minPrice === "number" ? { gte: input.minPrice } : {}),
            ...(typeof input.maxPrice === "number" ? { lte: input.maxPrice } : {}),
          };
        }

        const properties = await prisma.property.findMany({
          where,
          take: 15,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, category: true, community: true, area: true, bedrooms: true, price: true, project: { select: { name: true } } },
        });
        return { properties };
      }

      case "search_deals": {
        const scope = can(user.role, "deals");
        if (scope === "none") return { error: "You don't have access to deals." };

        const and: object[] = [];
        if (typeof input.stage === "string" && input.stage) and.push({ stage: input.stage });
        if (scope === "own") and.push({ agentId: user.id });
        if (scope === "team") {
          and.push(user.teamId ? { agent: { teamId: user.teamId } } : { agentId: user.id });
        }

        const deals = await prisma.deal.findMany({
          where: and.length ? { AND: and } : {},
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, title: true, type: true, stage: true, value: true, currency: true,
            contact: { select: { fullName: true } }, agent: { select: { name: true } },
          },
        });
        return { deals };
      }

      case "search_developers": {
        const scope = can(user.role, "developers");
        if (scope === "none") return { error: "You don't have access to developer data." };

        const where: Record<string, unknown> = {};
        if (typeof input.name === "string" && input.name) where.name = { contains: input.name };

        const developers = await prisma.company.findMany({
          where,
          take: 10,
          orderBy: { name: "asc" },
          select: {
            name: true, city: true, registrationStatus: true,
            projects: { select: { name: true, location: true, status: true, startingPrice: true }, take: 5 },
          },
        });
        return { developers };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    console.error(`Tool execution error (${name}):`, err);
    return { error: "Tool execution failed." };
  }
}

export async function askAssistant(history: ChatMessage[]): Promise<{ reply: string | null; error: string | null }> {
  const session = await auth();
  if (!session?.user?.id) return { reply: null, error: "Unauthorized" };

  if (!isAIConfigured()) {
    return { reply: null, error: "AI assistant isn't configured yet. Add ANTHROPIC_API_KEY to your .env file." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, role: true, teamId: true },
  });
  if (!user) return { reply: null, error: "Your session is invalid. Please sign out and sign in again." };

  const systemPrompt = `You are the AI assistant embedded in BIG B Properties' Dubai real estate CRM, helping ${user.name} (role: ${user.role}). Use the available tools to look up real data from the CRM before answering questions about leads, deals, properties, or developers — never invent data or numbers. Keep answers concise and practical for a busy real estate agent. You can draft message text (e.g. a WhatsApp or email reply to a client) when asked, but never claim to have sent it — only the agent can send it.`;

  const messages: Anthropic.MessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  try {
    const client = getAnthropicClient();

    for (let step = 0; step < 6; step++) {
      const response = await client.messages.create({
        model: AI_MODEL,
        max_tokens: 1536,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      });

      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      if (toolUses.length === 0) {
        const text = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("\n")
          .trim();
        return { reply: text || "I don't have a response for that — could you rephrase?", error: null };
      }

      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUses) {
        const result = await executeTool(toolUse.name, (toolUse.input ?? {}) as Record<string, unknown>, user);
        toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result) });
      }
      messages.push({ role: "user", content: toolResults });
    }

    return { reply: null, error: "The assistant took too many steps to answer that. Try a simpler or more specific question." };
  } catch (err) {
    console.error("askAssistant error:", err);
    return { reply: null, error: "AI assistant request failed. Please try again." };
  }
}
