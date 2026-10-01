export const PROMPT_VERSION = "fix-schema-v1";
export function userPrompt(context: string) { return `Return a schema repair proposal without inventing facts.\n${context}`; }
