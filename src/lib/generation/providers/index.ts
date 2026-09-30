import { GeminiProvider } from "./gemini";
import { GroqProvider } from "./groq";
import { ManualProvider } from "./manual";
import type { LlmProvider } from "../types";

export { GeminiProvider, GroqProvider, ManualProvider };
export type { LlmProvider } from "../types";

export function getConfiguredLlmProvider(): LlmProvider {
  if (process.env.AUTOMATION_ENABLED === "false" || process.env.LLM_PROVIDER === "manual") {
    return new ManualProvider();
  }
  if (process.env.LLM_PROVIDER === "groq") return new GroqProvider();
  const fallback = process.env.LLM_FALLBACK_PROVIDER === "groq" ? new GroqProvider() : undefined;
  return new GeminiProvider({ fallback });
}
