export const PROMPT_VERSION = "meta-rewrite-v1";
export function userPrompt(context: string) { return `Provide exactly three metadata alternatives.\n${context}`; }
