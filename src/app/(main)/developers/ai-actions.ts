"use server";

import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAnthropicClient, isAIConfigured, AI_MODEL } from "@/lib/ai";

const REPORT_PROJECTS_TOOL: Anthropic.Tool = {
  name: "report_projects",
  description: "Report the developer's current or notable real estate projects found via research.",
  input_schema: {
    type: "object",
    properties: {
      projects: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Project name" },
            location: { type: "string", description: "Area/community/emirate, e.g. 'Jumeirah Village Circle, Dubai'" },
            masterCommunity: { type: "string" },
            status: { type: "string", description: "e.g. Off-Plan, Under Construction, Ready, Launched, Sold Out" },
            unitTypes: { type: "string", description: "e.g. 'Studios, 1-3 bedroom apartments'" },
            startingPrice: { type: "number", description: "Starting price in AED, omit if unclear" },
            paymentPlan: { type: "string" },
            expectedCompletion: { type: "string", description: "ISO date (YYYY-MM-DD) if a specific/consistent date was found, otherwise omit" },
          },
          required: ["name"],
        },
      },
    },
    required: ["projects"],
  },
};

export async function refreshDeveloperProjectsWithAI(developerId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!isAIConfigured()) throw new Error("AI isn't configured yet. Add ANTHROPIC_API_KEY to your .env file.");

  const developer = await prisma.company.findUnique({
    where: { id: developerId },
    include: { projects: { select: { name: true } } },
  });
  if (!developer) throw new Error("Developer not found.");

  const prompt = `Research the real estate developer "${developer.name}"${developer.city ? ` (based in ${developer.city}, UAE)` : ""} and find their current or recently launched projects. Search the web for up-to-date information.

Only report real projects you actually find evidence for — never invent project names or numbers. Where sources disagree, prefer the developer's own site or the most recent/consistent figure, and omit a field rather than guess if you're unsure.

Once you've researched, call report_projects with up to 6 of the developer's most current/notable projects.`;

  let addedCount = 0;
  let skippedCount = 0;

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }, REPORT_PROJECTS_TOOL],
      messages: [{ role: "user", content: prompt }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === "report_projects"
    );

    if (!toolUse) {
      throw new Error("AI couldn't find structured project data for this developer. Try again, or add projects manually.");
    }

    const input = toolUse.input as {
      projects?: Array<{
        name: string;
        location?: string;
        masterCommunity?: string;
        status?: string;
        unitTypes?: string;
        startingPrice?: number;
        paymentPlan?: string;
        expectedCompletion?: string;
      }>;
    };

    const existingNames = new Set(developer.projects.map((p) => p.name.trim().toLowerCase()));

    for (const p of input.projects ?? []) {
      const name = p.name?.trim();
      if (!name) continue;
      if (existingNames.has(name.toLowerCase())) {
        skippedCount++;
        continue;
      }

      let expectedCompletion: Date | null = null;
      if (p.expectedCompletion) {
        const parsed = new Date(p.expectedCompletion);
        if (!Number.isNaN(parsed.getTime())) expectedCompletion = parsed;
      }

      await prisma.project.create({
        data: {
          name,
          developerId: developer.id,
          location: p.location ?? null,
          masterCommunity: p.masterCommunity ?? null,
          status: p.status ?? null,
          unitTypes: p.unitTypes ?? null,
          startingPrice: typeof p.startingPrice === "number" ? p.startingPrice : null,
          paymentPlan: p.paymentPlan ?? null,
          expectedCompletion,
          createdById: session.user.id,
        },
      });
      existingNames.add(name.toLowerCase());
      addedCount++;
    }
  } catch (err) {
    console.error("refreshDeveloperProjectsWithAI error:", err);
    const message = err instanceof Error ? err.message : "AI project refresh failed. Please try again.";
    redirect(`/developers/${developerId}?ai_error=${encodeURIComponent(message)}`);
  }

  redirect(`/developers/${developerId}?ai_added=${addedCount}&ai_skipped=${skippedCount}`);
}
