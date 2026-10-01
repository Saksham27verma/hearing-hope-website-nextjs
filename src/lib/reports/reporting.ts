import { z } from "zod";
import { DailyLlmCapReachedError } from "@/lib/generation/quota";
import type { LlmProvider } from "@/lib/generation/types";

export function reportHtml(type: "weekly" | "monthly", metrics: Record<string, any>, narrative = "") {
  return `<main style="font-family:Arial,sans-serif;max-width:720px;margin:auto"><h1>Hearing Hope ${type} report</h1><p>${metrics.period.start} to ${metrics.period.end}</p><h2>Organic search</h2><p>${metrics.organic.current.clicks} clicks and ${metrics.organic.current.impressions} impressions.</p><h2>AI visibility</h2><p>${metrics.aiCitationRate}% citation rate.</p><h2>Attribution</h2><ul>${Object.entries(metrics.attribution).map(([source, count]) => `<li>${source}: ${count}</li>`).join("") || "<li>No booking attribution yet.</li>"}</ul>${narrative ? `<h2>Monthly narrative</h2><p>${narrative}</p>` : ""}</main>`;
}

const narrativeSchema = z.object({ narrative: z.string().refine((value) => { const words = value.trim().split(/\s+/).filter(Boolean).length; return words >= 200 && words <= 300; }, "Monthly narrative must be 200–300 words.") });
export async function monthlyNarrative(metrics: Record<string, unknown>, provider: LlmProvider) {
  const fallback = `Organic clicks were ${String((metrics.organic as { current?: { clicks?: number } } | undefined)?.current?.clicks ?? 0)} during this period. AI citation rate was ${String(metrics.aiCitationRate ?? 0)}%. Review the highest-gaining queries, address pages needing Core Web Vitals attention, and use the attribution breakdown to prioritise the channels that produce appointments.`;
  if (provider.name === "manual") return { narrative: fallback, source: "template" as const };
  try {
    const response = await provider.generateJson({ systemPrompt: "Write 200-300 words from the supplied JSON only. Do not invent figures, claims, events, causes, or recommendations not supported by the JSON. Include exactly three practical recommended actions.", userPrompt: JSON.stringify(metrics), schema: narrativeSchema, maxOutputTokens: 450 });
    return { narrative: response.data.narrative, source: "llm" as const };
  } catch (error) {
    if (error instanceof DailyLlmCapReachedError || error instanceof Error) return { narrative: fallback, source: "template" as const };
    throw error;
  }
}

export function telegramSummary(metrics: Record<string, any>) {
  return [`${metrics.period.days}-day report: ${metrics.organic.current.clicks} organic clicks`, `${metrics.organic.current.impressions} impressions; AI citation ${metrics.aiCitationRate}%`, `${metrics.tickets.published} drafts published; ${metrics.tickets.pending} pending`, `GBP calls: ${Object.values(metrics.gbp).reduce((total: number, item: any) => total + item.calls, 0)}`, `LLM requests: ${metrics.llm.requests}/${metrics.llm.cap}`].join("\n");
}
