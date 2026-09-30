import { getLlmQuota, type LlmQuota } from "../quota";
import type { GenerateJsonArgs, LlmProvider } from "../types";

export type GroqProviderOptions = {
  apiKey?: string;
  model?: string;
  quota?: LlmQuota;
  request?: typeof fetch;
};

export class GroqProvider implements LlmProvider {
  readonly name = "groq" as const;
  readonly model: string;
  private readonly apiKey: string;
  private readonly quota: LlmQuota;
  private readonly request: typeof fetch;

  constructor(options: GroqProviderOptions = {}) {
    const apiKey = options.apiKey ?? process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("Add GROQ_API_KEY to use the Groq fallback.");
    this.apiKey = apiKey;
    this.model = options.model ?? process.env.GROQ_MODEL ?? "";
    if (!this.model) throw new Error("Add GROQ_MODEL to use the Groq fallback.");
    this.quota = options.quota ?? getLlmQuota();
    this.request = options.request ?? fetch;
  }

  async generateJson<T>(args: GenerateJsonArgs<T>) {
    const result = await this.quota.run({
      provider: this.name,
      model: this.model,
      request: async () => {
        const response = await this.request("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            authorization: `Bearer ${this.apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: this.model,
            response_format: { type: "json_object" },
            max_tokens: args.maxOutputTokens,
            messages: [
              { role: "system", content: args.systemPrompt },
              { role: "user", content: args.userPrompt },
            ],
          }),
        });
        if (!response.ok) {
          const error = new Error(`Groq generation failed (${response.status}).`);
          Object.assign(error, { status: response.status });
          throw error;
        }
        const body = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const content = body.choices?.[0]?.message?.content;
        const data = args.schema.parse(JSON.parse(content ?? ""));
        return {
          value: data,
          usage: {
            inputTokens: body.usage?.prompt_tokens ?? 0,
            outputTokens: body.usage?.completion_tokens ?? 0,
          },
        };
      },
    });
    return { data: result.value, usage: result.usage };
  }
}
