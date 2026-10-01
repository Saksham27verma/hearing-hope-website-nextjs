export const PROMPT_VERSION = "refresh-v1";
export function userPrompt(context: string) { return `Refresh this page; include change_summary.\n${context}`; }
