export const PROMPT_VERSION = "review-reply-v1";
export function userPrompt(context: string) { return `Write a concise, safe review reply.\n${context}`; }
