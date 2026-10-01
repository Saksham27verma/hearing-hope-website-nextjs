export const PROMPT_VERSION = "add-faq-v1";
export function userPrompt(context: string) { return `Add only useful FAQ items.\n${context}`; }
