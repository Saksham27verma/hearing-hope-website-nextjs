import { createServiceSupabaseClient } from "@/lib/supabase/service";
import type { LlmUsage } from "./types";

export type UsageRow = {
  provider: string;
  model: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  errors429: number;
};

export type UsageDelta = {
  requests?: number;
  inputTokens?: number;
  outputTokens?: number;
  errors429?: number;
};

export interface LlmUsageStore {
  list(date: string): Promise<UsageRow[]>;
  increment(date: string, provider: string, model: string, delta: UsageDelta): Promise<void>;
}

export interface QuotaNotifier {
  quotaReached(args: { cap: number; waitingTickets: number }): Promise<void>;
}

export type QuotaOptions = {
  cap?: number;
  minIntervalMs?: number;
  store?: LlmUsageStore;
  notifier?: QuotaNotifier;
  now?: () => Date;
  sleep?: (milliseconds: number) => Promise<void>;
};

export class DailyLlmCapReachedError extends Error {
  constructor(readonly cap: number) {
    super(`Daily LLM request cap (${cap}) reached.`);
    this.name = "DailyLlmCapReachedError";
  }
}

function configuredNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function indianDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export class SupabaseLlmUsageStore implements LlmUsageStore {
  async list(date: string) {
    const supabase = createServiceSupabaseClient();
    const { data, error } = await supabase
      .from("llm_usage")
      .select("provider, model, requests, input_tokens, output_tokens, errors_429")
      .eq("date", date);
    if (error) throw new Error(`Could not read LLM usage: ${error.message}`);

    return (data ?? []).map((row) => ({
      provider: row.provider,
      model: row.model,
      requests: row.requests,
      inputTokens: row.input_tokens,
      outputTokens: row.output_tokens,
      errors429: row.errors_429,
    }));
  }

  async increment(date: string, provider: string, model: string, delta: UsageDelta) {
    const supabase = createServiceSupabaseClient();
    const { data: existing, error: readError } = await supabase
      .from("llm_usage")
      .select("requests, input_tokens, output_tokens, errors_429")
      .eq("date", date)
      .eq("provider", provider)
      .eq("model", model)
      .maybeSingle();
    if (readError) throw new Error(`Could not read provider LLM usage: ${readError.message}`);

    const { error } = await supabase.from("llm_usage").upsert(
      {
        date,
        provider,
        model,
        requests: (existing?.requests ?? 0) + (delta.requests ?? 0),
        input_tokens: (existing?.input_tokens ?? 0) + (delta.inputTokens ?? 0),
        output_tokens: (existing?.output_tokens ?? 0) + (delta.outputTokens ?? 0),
        errors_429: (existing?.errors_429 ?? 0) + (delta.errors429 ?? 0),
      },
      { onConflict: "date,provider,model" },
    );
    if (error) throw new Error(`Could not record LLM usage: ${error.message}`);
  }
}

export class TelegramQuotaNotifier implements QuotaNotifier {
  async quotaReached({ cap, waitingTickets }: { cap: number; waitingTickets: number }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (!token || !chatId) return;

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Daily LLM cap (${cap}) reached. ${waitingTickets} tickets are waiting. They will resume tomorrow or can be done manually.`,
      }),
    });
    if (!response.ok) throw new Error(`Telegram quota alert failed (${response.status}).`);
  }
}

const noopNotifier: QuotaNotifier = { quotaReached: async () => {} };

export class LlmQuota {
  private serial: Promise<void> = Promise.resolve();
  private lastRequestAt = 0;
  private alertedDates = new Set<string>();
  private readonly cap: number;
  private readonly minIntervalMs: number;
  private readonly store: LlmUsageStore;
  private readonly notifier: QuotaNotifier;
  private readonly now: () => Date;
  private readonly sleep: (milliseconds: number) => Promise<void>;

  constructor(options: QuotaOptions = {}) {
    this.cap = options.cap ?? configuredNumber(process.env.LLM_DAILY_REQUEST_CAP, 40);
    this.minIntervalMs = options.minIntervalMs ?? configuredNumber(process.env.LLM_MIN_INTERVAL_SECONDS, 10) * 1000;
    this.store = options.store ?? new SupabaseLlmUsageStore();
    this.notifier = options.notifier ?? (process.env.TELEGRAM_BOT_TOKEN ? new TelegramQuotaNotifier() : noopNotifier);
    this.now = options.now ?? (() => new Date());
    this.sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  }

  async run<T>(args: {
    provider: string;
    model: string;
    waitingTickets?: number;
    request: () => Promise<{ value: T; usage: LlmUsage }>;
  }): Promise<{ value: T; usage: LlmUsage }> {
    const release = await this.reserve(args.provider, args.model, args.waitingTickets ?? 0);
    try {
      const result = await args.request();
      await this.store.increment(indianDate(this.now()), args.provider, args.model, {
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
      return result;
    } catch (error) {
      if (isQuotaResponse(error)) {
        await this.store.increment(indianDate(this.now()), args.provider, args.model, { errors429: 1 });
      }
      throw error;
    } finally {
      release();
    }
  }

  private async reserve(provider: string, model: string, waitingTickets: number) {
    let release!: () => void;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.serial;
    this.serial = previous.then(() => current);
    await previous;

    const date = indianDate(this.now());
    const usage = await this.store.list(date);
    const used = usage.reduce((total, row) => total + row.requests, 0);
    if (used >= this.cap) {
      release();
      if (!this.alertedDates.has(date)) {
        this.alertedDates.add(date);
        await this.notifier.quotaReached({ cap: this.cap, waitingTickets });
      }
      throw new DailyLlmCapReachedError(this.cap);
    }

    const elapsed = this.now().getTime() - this.lastRequestAt;
    if (this.lastRequestAt && elapsed < this.minIntervalMs) {
      await this.sleep(this.minIntervalMs - elapsed);
    }
    this.lastRequestAt = this.now().getTime();
    await this.store.increment(date, provider, model, { requests: 1 });
    return release;
  }
}

export function isQuotaResponse(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
  const message = error instanceof Error ? error.message : String(error);
  return status === 429 || /\b429\b|quota|resource exhausted/i.test(message);
}

let sharedQuota: LlmQuota | undefined;

export function getLlmQuota() {
  sharedQuota ??= new LlmQuota();
  return sharedQuota;
}
