import * as addFaq from "./add-faq"; import * as fixSchema from "./fix-schema"; import * as gbpPost from "./gbp-post"; import * as metaRewrite from "./meta-rewrite"; import * as newPage from "./new-page"; import * as refresh from "./refresh"; import * as reviewReply from "./review-reply";
import type { GenerationTicketType } from "../schemas";
const prompts = { new_page: newPage, refresh, add_faq: addFaq, meta_rewrite: metaRewrite, fix_schema: fixSchema, review_reply: reviewReply, gbp_post: gbpPost } as const;
export function promptFor(type: GenerationTicketType, context: string) { const prompt = prompts[type]; return { version: prompt.PROMPT_VERSION, userPrompt: prompt.userPrompt(context) }; }
