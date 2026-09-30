import { createServiceSupabaseClient } from "@/lib/supabase/service";
import type { GenerateJsonArgs, LlmProvider } from "../types";

export interface BriefTicketStore {
  markBriefReady(ticketId: string, prompts: { systemPrompt: string; userPrompt: string }): Promise<void>;
}

export class SupabaseBriefTicketStore implements BriefTicketStore {
  async markBriefReady(ticketId: string, prompts: { systemPrompt: string; userPrompt: string }) {
    const { error } = await createServiceSupabaseClient()
      .from("content_tickets")
      .update({
        status: "brief_ready",
        brief_system_prompt: prompts.systemPrompt,
        brief_user_prompt: prompts.userPrompt,
      })
      .eq("id", ticketId);
    if (error) throw new Error(`Could not prepare manual brief: ${error.message}`);
  }
}

export class ManualProvider implements LlmProvider {
  readonly name = "manual" as const;
  private readonly tickets: BriefTicketStore;

  constructor(tickets: BriefTicketStore = new SupabaseBriefTicketStore()) {
    this.tickets = tickets;
  }

  async prepareBrief(ticketId: string, prompts: { systemPrompt: string; userPrompt: string }) {
    await this.tickets.markBriefReady(ticketId, prompts);
  }

  async generateJson<T>(_args: GenerateJsonArgs<T>): Promise<{ data: T; usage: { inputTokens: number; outputTokens: number } }> {
    throw new Error("Manual generation requires prepareBrief(ticketId, prompts); it never calls an LLM.");
  }
}
