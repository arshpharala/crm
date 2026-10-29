"use server";

import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getAnthropicClient, isAIConfigured, AI_MODEL } from "@/lib/ai";

export type PropertyMatch = {
  propertyId: string;
  score: number;
  reason: string;
  title: string;
  price: number;
  community: string | null;
  bedrooms: number | null;
};

type MatchState = { matches: PropertyMatch[]; error: string | null };

const REPORT_MATCHES_TOOL = {
  name: "report_matches",
  description: "Report the best-fit available properties for this lead's requirements.",
  input_schema: {
    type: "object" as const,
    properties: {
      matches: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            propertyId: { type: "string" as const, description: "The id= value from the property list" },
            score: { type: "number" as const, description: "Fit score from 0-100" },
            reason: { type: "string" as const, description: "One short sentence explaining why this fits the lead" },
          },
          required: ["propertyId", "score", "reason"],
        },
      },
    },
    required: ["matches"],
  },
};

export async function findMatchingProperties(_prevState: MatchState, formData: FormData): Promise<MatchState> {
  const session = await auth();
  if (!session?.user) return { matches: [], error: "Unauthorized" };

  if (!isAIConfigured()) {
    return { matches: [], error: "AI matching isn't configured yet. Add ANTHROPIC_API_KEY to your .env file." };
  }

  const leadId = String(formData.get("leadId") ?? "");
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return { matches: [], error: "Lead not found." };

  const properties = await prisma.property.findMany({
    where: { availability: "AVAILABLE" },
    include: { project: { include: { developer: true } } },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  if (properties.length === 0) {
    return { matches: [], error: "No available properties in inventory to match against." };
  }

  const propertyLines = properties
    .map((p) => {
      const parts = [
        `id=${p.id}`,
        p.title,
        p.category,
        [p.community, p.area, p.emirate].filter(Boolean).join(", ") || null,
        p.bedrooms != null ? `${p.bedrooms}BR` : null,
        `AED ${p.price}`,
        p.project ? `Project: ${p.project.name}${p.project.developer ? ` by ${p.project.developer.name}` : ""}` : null,
      ].filter(Boolean);
      return `- ${parts.join(" | ")}`;
    })
    .join("\n");

  const prompt = `You are a real estate matching assistant for a Dubai CRM. Given a lead's requirements and a list of available properties, pick the best-fit properties (up to 5), ranked by fit.

Lead requirements:
- Property interest: ${lead.propertyInterest ?? "not specified"}
- Budget: ${lead.budgetMin ?? "no min"} - ${lead.budgetMax ?? "no max"} ${lead.currency}
- Purpose: ${lead.purpose ?? "not specified"}
- Country: ${lead.country ?? "not specified"}

Available properties:
${propertyLines}

Return up to 5 matches, best first. Only include properties that are a reasonable fit for the budget and stated interest — if nothing fits well, return fewer matches or an empty list rather than forcing a bad match.`;

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      tools: [REPORT_MATCHES_TOOL],
      tool_choice: { type: "tool", name: "report_matches" },
      messages: [{ role: "user", content: prompt }],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return { matches: [], error: "AI did not return a usable response. Please try again." };
    }

    const input = toolUse.input as { matches?: Array<{ propertyId: string; score: number; reason: string }> };
    const propertyById = new Map(properties.map((p) => [p.id, p]));

    const matches: PropertyMatch[] = (input.matches ?? [])
      .map((m) => {
        const property = propertyById.get(m.propertyId);
        if (!property) return null;
        return {
          propertyId: property.id,
          score: Math.max(0, Math.min(100, Math.round(m.score))),
          reason: m.reason,
          title: property.title,
          price: property.price,
          community: property.community,
          bedrooms: property.bedrooms,
        };
      })
      .filter((m): m is PropertyMatch => m !== null)
      .slice(0, 5);

    return { matches, error: null };
  } catch (err) {
    console.error("findMatchingProperties error:", err);
    return { matches: [], error: "AI matching request failed. Please try again." };
  }
}

export async function enrichLeadWithAI(leadId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!isAIConfigured()) throw new Error("AI isn't configured yet. Add ANTHROPIC_API_KEY to your .env file.");

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("Lead not found.");

  const prompt = `You are helping a Dubai real estate agent prepare for a first call with a new lead. Search the web for PUBLIC, professional, business-relevant information about this person that could help the agent — e.g. employer/company, industry, professional background, or public investment/business activity.

Do not search for or report private details such as home address or family information, and never guess or invent anything — only report what you actually find, with a brief note of where it came from. If you find nothing meaningful, say so plainly in one sentence rather than speculating.

Lead:
- Name: ${lead.fullName}
- Phone: ${lead.phone}
- Email: ${lead.email ?? "not provided"}
- Country: ${lead.country ?? "not provided"}`;

  let summary: string;
  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 3 }],
      messages: [{ role: "user", content: prompt }],
    });

    summary =
      response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim() || "No findings.";
  } catch (err) {
    console.error("enrichLeadWithAI error:", err);
    throw new Error("AI enrichment request failed. Please try again.");
  }

  await prisma.activity.create({
    data: {
      type: "NOTE",
      content: `AI Web Enrichment:\n${summary}`,
      authorId: session.user.id,
      leadId,
    },
  });

  revalidatePath(`/leads/${leadId}`);
}
