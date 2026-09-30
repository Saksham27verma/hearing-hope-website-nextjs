# Cursor Prompt: SEO / AEO / GEO Automation System for Hearing Hope (zero-cost edition)

Paste everything below this line into Cursor. Run Phase 0 first, confirm its output, then say "proceed to Phase 1" and so on. Do not ask Cursor to do all phases in one go.

---

## Context

You are working inside the codebase of **Hearing Hope**, a hearing aid retail clinic chain in India. The repository contains (a) a custom CMS built in this workspace and (b) a Next.js website (App Router) that recently migrated from WordPress. Both share this codebase or are closely linked; inspect the repo to confirm the exact structure.

Your job is to build an **SEO / AEO / GEO automation system** that:

1. Continuously collects ranking, traffic, review, technical, and AI-visibility signals
2. Decides what content should be created, refreshed, or fixed
3. Uses the **Gemini API (free tier)** to generate drafts (pages, refreshes, FAQs, schema, meta tags, review replies, Google Business Profile posts), with a manual copy-paste path as fallback
4. Puts those drafts into a **human approval queue inside the CMS**, with Telegram and email notifications
5. On approval, publishes automatically and fires all downstream side effects (Next.js revalidation, sitemap, llms.txt, IndexNow, Google Indexing API)
6. Sends weekly and monthly reports

**Non-negotiable rule 1 (safety):** nothing AI-generated is ever published to the public site without a human clicking Approve, except review replies for 4- and 5-star reviews. This is a healthcare business. Every page about a condition, test, or treatment must carry a real human reviewer's name and date.

**Non-negotiable rule 2 (cost):** total recurring API cost must be zero. Only free-tier services are used: Gemini API free tier, Groq free tier (optional fallback), Google Search Console / Business Profile / PageSpeed Insights / Indexing APIs, IndexNow, Reddit API, Telegram Bot API, GitHub Actions for scheduling, and the existing email provider or a free email tier. Never add Anthropic, OpenAI, Perplexity, or any paid SERP API adapter unless I explicitly ask. Every LLM call goes through a hard daily request cap.

## Working rules for you (Cursor)

- Before writing any code, inspect the repo and produce the Phase 0 report. Do not assume a stack.
- Reuse the existing CMS's auth, database, ORM, UI components, and conventions. Do not introduce a second ORM, a second UI kit, or a parallel admin.
- Every new module gets a short README section and at least basic tests.
- Every external API key comes from environment variables. Never hardcode keys. Add all new variables to `.env.example` with a comment.
- All scheduled jobs must be idempotent (safe to re-run) and must log start, end, item counts, and errors.
- Prefer small, composable functions and clear folder boundaries over cleverness.
- After each phase, list exactly which files you created or changed and how to verify the phase works.
- If a decision would materially change the architecture (e.g. the CMS has no API layer at all), stop and ask me before proceeding.

---

## Phase 0: Discovery (report only, no code changes)

Inspect the repository and answer:

1. **Stack**: framework, language, database, ORM, auth system, UI library, hosting target (Vercel? self-hosted? which plan?), package manager.
2. **CMS structure**: how are pages/articles stored? List the current content models and their fields. How does the Next.js site read content (direct DB, internal API, external API)?
3. **Existing API surface**: does the CMS expose REST/GraphQL routes? List them. Does it have any webhook or event system on publish/update?
4. **Existing scheduling**: any cron, queue, or background job system already present?
5. **Next.js SEO state**: does the site already use `generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD? Which routes exist for clinics, products, tests, guides, blog?
6. **Notification capability**: any existing email sending (Resend, SES, Nodemailer, Brevo, etc.)?
7. **Hosting check**: if the site is on Vercel Hobby, flag that Hobby prohibits commercial use and that cron limits are restrictive; recommend GitHub Actions scheduling regardless.
8. **Gaps**: what is missing for the system described above, and your recommended approach for each gap given the existing stack.

Output this as a structured report. Wait for my confirmation before Phase 1.

---

## Phase 1: Data model and CMS foundations

Extend the CMS data model. Adapt field names to the existing conventions, but the concepts must all exist.

### 1.1 Content page fields (add to the existing page/article model, or create a shared `seo` sub-object)

- `slug` (unique, immutable after publish)
- `page_type`: enum `clinic | product | test | condition | guide | comparison | blog | landing`
- `status`: enum `draft | in_review | changes_requested | approved | published | archived`
- `meta_title` (max 60 chars, validated)
- `meta_description` (max 160 chars, validated)
- `canonical_url` (optional override)
- `answer_summary`: 40–60 word direct answer to the page's core question, shown at the top of the page
- `faq_items`: array of `{ question, answer }`
- `json_ld`: JSON, generated and stored per page
- `sources`: array of `{ title, url, accessed_at }` for medical claims
- `author_id` → references a `team_members` record
- `reviewed_by_id` → references `team_members`, nullable
- `reviewed_at`: timestamp, nullable. **Only set by the approve action, never by AI or bulk import.**
- `review_notes`: text, for "changes requested" feedback
- `generation_meta`: JSON `{ source: 'ai' | 'manual' | 'human', provider, model, trigger_ticket_id, prompt_version, generated_at }`
- `last_content_update_at`: timestamp updated on any body change
- `priority_score`: integer, set by the decision engine
- `internal_links`: array of slugs this page should link to (used for hub-and-spoke enforcement)

### 1.2 New models

**`team_members`**: `name`, `role` (audiologist, clinic_manager, admin, marketing), `credentials` (e.g. "M.Sc. Audiology, RCI registered"), `email`, `telegram_chat_id` (nullable), `photo_url`, `bio`, `is_reviewer` (bool), `sameAs_urls` (array). Used for bylines, "medically reviewed by", and notifications.

**`clinics`**: `name`, `slug`, `address` (structured: street, locality, city, state, postal_code, country), `lat`, `lng`, `phone`, `whatsapp`, `email`, `opening_hours` (structured per weekday), `gbp_location_id` (Google Business Profile), `gbp_place_id`, `gbp_review_link`, `manager_id` → team_members, `services` (array), `photos`, `local_faq` (array), `status`.

**`content_tickets`**: the work queue.
- `type`: enum `new_page | refresh | add_faq | fix_schema | meta_rewrite | review_reply | gbp_post | technical_issue`
- `status`: enum `open | generating | brief_ready | draft_ready | in_review | changes_requested | approved | published | dismissed | failed`
- `priority_score`: integer
- `reason`: human-readable explanation, e.g. "Query 'BERA test cost' has 1,240 impressions/28d and no matching page"
- `evidence`: JSON (the raw signals that produced it)
- `target_page_id`: nullable, for refresh/fix types
- `target_clinic_id`: nullable
- `suggested_slug`, `suggested_page_type`, `target_keywords` (array)
- `assigned_reviewer_id` → team_members
- `generated_page_id`: nullable, the draft this ticket produced
- `brief_system_prompt`, `brief_user_prompt`: text, the exact prompts used or to be used (for the manual path and for debugging)
- `attempts`, `last_error`
- `created_at`, `updated_at`, `resolved_at`

**`signals_search_console`**: daily rows of `date, page_url, query, clicks, impressions, ctr, position, country, device`. Unique on `(date, page_url, query, country, device)`.

**`signals_gbp_reviews`**: `clinic_id, gbp_review_id (unique), rating, text, author_name, created_at, reply_text, reply_status (none | draft | auto_published | published), replied_at`.

**`signals_gbp_insights`**: `clinic_id, date, calls, direction_requests, website_clicks, views_search, views_maps`.

**`signals_web_vitals`**: `date, url, strategy (mobile | desktop), lcp, inp, cls, performance_score, raw_json`.

**`signals_ai_visibility`**: `date, engine (gemini | chatgpt | perplexity | google_ai_mode | claude), source (auto | manual), question, response_text (nullable for manual), cited_domains (array), our_domain_cited (bool), our_urls_cited (array), competitor_domains_cited (array), recorded_by_id (nullable)`.

**`signals_competitors`**: `competitor_domain, url, first_seen_at, last_seen_at, title`.

**`signals_questions`**: `question, normalized_question (unique), source (gsc | reddit | staff), volume_hint, seen_count, first_seen_at, last_seen_at, clinic_id (nullable, for staff-submitted)`.

**`ai_probe_questions`**: `question, category (test | product | condition | clinic | pricing), is_active`. Seed with 20 questions (see Appendix A).

**`review_edits`**: `page_id, ticket_id, reviewer_id, field, ai_version, human_version, created_at`. Captures every edit a reviewer makes to an AI draft, for prompt improvement.

**`job_runs`**: `job_name, started_at, finished_at, status, items_processed, llm_requests_used, errors (JSON), notes`.

**`llm_usage`**: `date, provider, model, requests, input_tokens, output_tokens, errors_429`. One row per day per provider; used for the daily cap.

**`notifications`**: `recipient_id, channel (email | telegram | in_app), type, payload (JSON), sent_at, status, error`.

### 1.3 Internal API layer

If the CMS has no API for content, add route handlers (matching the existing framework) under an `/api/internal/` namespace, authenticated with a server-to-server bearer token from `INTERNAL_API_TOKEN`:

- `GET /pages?status=&page_type=&updated_before=&limit=&cursor=` – list with filters
- `GET /pages/:id`
- `POST /pages` – create (always forces `status: draft`, `generation_meta.source: ai` when called by automation)
- `PATCH /pages/:id` – update fields; **rejects** any attempt to set `status` beyond `in_review`, or to set `reviewed_by_id`/`reviewed_at`
- `POST /pages/:id/submit-for-review`
- `POST /pages/:id/approve` – **session-authenticated human only**, requires `is_reviewer`; sets `reviewed_by_id`, `reviewed_at`, `status: approved`, then triggers publish
- `POST /pages/:id/request-changes` – with `review_notes`
- `GET /tickets`, `PATCH /tickets/:id`
- `GET /clinics`, `GET /team-members`

### 1.4 Publish event bus

Implement a simple internal event system (or use the existing one) with events: `page.published`, `page.updated`, `page.archived`, `review.received`, `review.reply_published`, `ticket.draft_ready`, `ticket.brief_ready`, `technical.cwv_regression`. Later phases subscribe to these.

### 1.5 CMS UI

Add to the existing admin:

- **Review Queue** page: lists pages in `draft` / `in_review` / `changes_requested`, sorted by `priority_score` desc, showing type, title, reason (from ticket), age, assigned reviewer. Filters by reviewer and page type.
- **Review screen** for a page: side-by-side of the rendered draft and the editable fields; shows the ticket reason and evidence; shows generated JSON-LD (collapsed, with a "validate" button that calls the schema validator); buttons: Approve, Request Changes (with notes), Dismiss. Approve must take under two minutes for a good draft: no extra confirmation dialogs beyond one.
- **Tickets** page: all tickets with status, type, priority, reason; ability to dismiss, re-queue, or "Generate now"; for tickets in `brief_ready`, a **"Copy brief"** button and a **"Paste response"** textarea (see Phase 4.3).
- **Manual AI check** page (monthly): lists all active probe questions with a copy button each; for each engine (ChatGPT, Perplexity, Google AI Mode, Claude) a checkbox "we were cited" and a text field "competitor domains cited"; a Save button writes `signals_ai_visibility` rows with `source: manual`.
- **Patient questions** form: a simple form clinic staff can open on a phone: question text, clinic, optional note. Writes to `signals_questions` with `source: staff`.
- **Signals dashboard**: minimal, five cards (organic clicks 28d, GBP calls 28d, AI citation rate, pending reviews, LLM requests used today / cap) and a table of last 10 job runs.
- **Clinics** and **Team Members** CRUD if not already present.

Diff tracking: when a reviewer edits any field on an AI-generated page before approving, write a `review_edits` row per changed field.

**Verification for Phase 1**: migrations run cleanly; I can create a page via the internal API with the bearer token and it lands as `draft`; I cannot approve via the API token; I can approve via the admin UI and `reviewed_by_id`/`reviewed_at` are set; the review queue lists it.

---

## Phase 2: Next.js SEO foundations

Work in the Next.js site. Adapt to the existing routes.

### 2.1 Metadata

- Implement `generateMetadata` for every content route, reading `meta_title`, `meta_description`, `canonical_url`, Open Graph and Twitter fields from the CMS. Fall back sensibly if empty (title from H1 + " | Hearing Hope").
- `app/sitemap.ts`: dynamic, includes all `published` pages with `lastModified = last_content_update_at`, plus clinic pages. Split into a sitemap index if over 5,000 URLs.
- `app/robots.ts`: allow all; explicitly allow `GPTBot`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Bingbot`; disallow `/admin`, `/api`; reference the sitemap.
- `app/llms.txt/route.ts`: generates a Markdown summary at `/llms.txt`: one paragraph about Hearing Hope, list of clinics with city and phone, list of services, then top guide/test/product pages with one-line descriptions. Regenerate on every publish (cache with a tag).
- Serve the IndexNow key file at `/{INDEXNOW_KEY}.txt`.

### 2.2 JSON-LD components

Create a `lib/seo/schema/` module with a builder per page type, each returning a JSON-LD object, and a `<JsonLd>` component that renders it in a `<script type="application/ld+json">`. Builders:

- `organization()` – site-wide, includes `sameAs` from a config list
- `medicalClinic(clinic)` – `@type: ["MedicalClinic", "LocalBusiness"]`, `medicalSpecialty: "Audiology"`, address as `PostalAddress`, `geo`, `openingHoursSpecification`, `telephone`, `hasMap`, `aggregateRating` only if you have real review data
- `product(page)` – `@type: Product`, `brand`, `category`, `offers` with `priceCurrency: INR` and `availability`; add `additionalType: "https://schema.org/MedicalDevice"`
- `medicalTest(page)` – `@type: MedicalTest`, `usedToDiagnose`, `howPerformed`, `preparation`, `normalRange` where applicable
- `medicalCondition(page)` – `@type: MedicalCondition`
- `article(page, author, reviewer)` – `@type: ["Article", "MedicalWebPage"]`, `author` as `Person` with `jobTitle` and `sameAs`, `reviewedBy` as `Person`, `dateModified`, `lastReviewed`
- `faqPage(faq_items)` – appended whenever `faq_items` is non-empty
- `breadcrumbList(path)`

The CMS `json_ld` field stores the generated output; the site renders from the field so the reviewer sees exactly what will ship. Add a validation utility that checks required properties per type and is called by the CMS "validate" button.

### 2.3 Page template requirements (for AEO/GEO)

For test, condition, product, comparison, and guide templates, enforce this structure in the layout:

1. H1
2. `answer_summary` in a visually distinct block directly under the H1
3. Byline: author name, credentials, "Medically reviewed by {reviewer}, {credentials} on {date}" (render only if `reviewed_by_id` is set)
4. Body (H2s should be question-form; this is enforced at generation, not in the template)
5. FAQ block rendered from `faq_items`
6. Sources block rendered from `sources`
7. Related pages (from `internal_links`) and the nearest clinic CTA

### 2.4 Revalidation

Add `POST /api/revalidate` (protected by `REVALIDATE_SECRET`) that accepts a slug and page type, calls `revalidatePath` for the page, its hub, the sitemap, and `llms.txt` tags.

**Verification for Phase 2**: view-source on a test page shows full HTML content (not a client shell), the JSON-LD validates at validator.schema.org, `/sitemap.xml`, `/robots.txt`, `/llms.txt` all respond correctly, Lighthouse SEO score 100 on a sample page.

---

## Phase 3: Signals pipeline and scheduling

### 3.0 Scheduling via GitHub Actions

Implement every job as a protected `POST /api/jobs/{job-name}` route handler that checks a `CRON_SECRET` bearer token, runs the job, and returns a JSON summary. Generate `.github/workflows/scheduled-jobs.yml` with one `schedule` cron entry per job (times below are IST; convert to UTC in the file) that calls the endpoint with `curl` using repository secrets `CRON_SECRET` and `SITE_URL`. Include a `workflow_dispatch` input so any job can be triggered manually from the GitHub UI. Every job writes a `job_runs` row. If the repo already has a job runner, use it instead but keep the same endpoint interface.

### 3.1 `sync-search-console` (daily, 03:00 IST)

Google Search Console API, service account (`GSC_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL`). Pull the last 3 days (GSC lags ~2 days) with dimensions `date, page, query, country, device`, rows up to 25,000, and upsert into `signals_search_console`. Also pull URL inspection for any page published in the last 7 days and log index status.

### 3.2 `sync-gbp` (every 4 hours)

Google Business Profile API (`GBP_SERVICE_ACCOUNT_JSON`, account/location IDs from `clinics.gbp_location_id`). For each clinic: pull new reviews and upsert into `signals_gbp_reviews`; pull daily insights into `signals_gbp_insights`. New reviews emit `review.received`.

### 3.3 `sync-web-vitals` (daily, 04:00 IST)

PageSpeed Insights API (`PSI_API_KEY`, free). For a configured list of 20 key URLs (homepage, 5 clinics, 5 tests, 5 products, 4 guides) run mobile + desktop, store in `signals_web_vitals`. If LCP > 2.5s, INP > 200ms, or CLS > 0.1 on a page that previously passed, emit `technical.cwv_regression`.

### 3.4 `sync-competitors` (weekly, Monday 05:00 IST)

For each domain in `COMPETITOR_DOMAINS` (comma-separated env), fetch `/sitemap.xml` (follow index sitemaps), diff against `signals_competitors`, insert new URLs with `first_seen_at`. Fetch the `<title>` of each new URL (respect robots.txt, 1 request/second, custom user agent).

### 3.5 `probe-ai-visibility` (weekly, Monday 06:00 IST)

Automated for **Gemini only**: for every active `ai_probe_questions` row, call the Gemini API with Google Search grounding enabled, extract cited URLs from the grounding metadata (parse the structured response, do not regex prose), set `our_domain_cited` by matching `SITE_DOMAIN`, store in `signals_ai_visibility` with `source: auto`. This counts toward the daily LLM cap.

Other engines are covered by the **Manual AI check** page (Phase 1.5). On the 1st of each month, send the marketing reviewer a Telegram reminder with a link to that page.

### 3.6 `harvest-questions` (weekly, Monday 07:00 IST)

Build the candidate question list from free sources only:
- `signals_search_console` queries containing question words ("how", "what", "why", "can", "does", "is", "cost", "price", "near me", "vs")
- Reddit's free API (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, script-type app): search r/HearingAids, r/audiology, r/india, r/AskDocs for seed keywords from Appendix B, last 7 days, keep post titles that are questions
- Staff-submitted questions from the Patient questions form (already in the table)

Normalise (lowercase, strip punctuation, collapse whitespace), dedupe on `normalized_question`, increment `seen_count`.

**Verification for Phase 3**: each job can be triggered manually via `workflow_dispatch` and via curl with the secret, writes rows, writes a `job_runs` entry, and re-running does not duplicate rows.

---

## Phase 4: Decision engine, generation, and approval flow

### 4.1 `run-decision-engine` (daily, 05:30 IST, after signals sync)

Implement rules as individual pure functions in `lib/decisions/rules/`, each returning zero or more ticket candidates. Never create a duplicate open ticket for the same `(type, target)`; update `evidence` and `priority_score` instead.

Rules (tune thresholds via `config/decision-thresholds.ts`):

1. **Missing page**: a GSC query with ≥300 impressions/28d whose best-ranking page has position > 15, or which has no page containing the query's core terms in `slug`, `meta_title`, or H1 → `new_page` ticket. Cluster near-duplicate queries (token overlap ≥ 0.6) into one ticket. Priority = impressions × (1 − ctr).
2. **Question with no answer**: `signals_questions` row with `seen_count` ≥ 3 (or any staff-submitted question) with no page whose `faq_items` or H2s match ≥ 70% of its tokens → `add_faq` ticket on the closest page, or `new_page` if no close page.
3. **Stale page**: published page with `last_content_update_at` > 90 days and impressions/28d ≥ 100 → `refresh` ticket. Priority = impressions.
4. **Position drop**: page's 7-day average position worsened by ≥ 5 vs the prior 28 days on a query with ≥ 200 impressions → `refresh` ticket, high priority.
5. **Low CTR**: page with ≥ 1,000 impressions/28d and CTR < 1.5% at position ≤ 10 → `meta_rewrite` ticket.
6. **Schema gap**: published page of type test/product/condition/guide with empty `json_ld`, empty `faq_items`, or failing validation → `fix_schema` ticket.
7. **Not reviewed**: published YMYL page (test/condition/product/guide) with `reviewed_by_id` null → `refresh` ticket flagged `needs_medical_review`, highest priority.
8. **Competitor coverage**: competitor URL first seen in the last 7 days whose title contains a seed keyword and for which we have no matching page → `new_page` ticket, medium priority.
9. **AI visibility gap**: probe question where we were not cited (auto or manual) for 2 consecutive periods and a competitor was → `refresh` ticket on the best matching page (or `new_page`), with evidence listing which competitors were cited.
10. **Review pipeline**: clinic with < 2 new reviews in 30 days → Telegram nudge to the clinic manager with `clinics.gbp_review_link` (not a content ticket).
11. **CWV regression** event → `technical_issue` ticket + immediate email to `DEV_ALERT_EMAIL`.
12. **GBP post cadence**: each clinic with no GBP post in the last 25 days → `gbp_post` ticket.

Assign `assigned_reviewer_id`: YMYL page types → a reviewer with role `audiologist` (round-robin among `is_reviewer` audiologists); clinic/gbp/meta → `marketing`; technical → `admin`.

### 4.2 LLM provider layer

Create `lib/generation/providers/` with an adapter interface:

```ts
interface LlmProvider {
  name: string;
  generateJson<T>(args: {
    systemPrompt: string;
    userPrompt: string;
    schema: ZodSchema<T>;
    maxOutputTokens?: number;
  }): Promise<{ data: T; usage: { inputTokens: number; outputTokens: number } }>;
}
```

Adapters:

- **`gemini`** (default): Gemini API via the official `@google/genai` SDK, key from `GEMINI_API_KEY`, model from `GEMINI_MODEL` (default to the current free-tier Flash model; read the model list from https://ai.google.dev/gemini-api/docs/models at setup and put the exact name in `.env.example` with a comment). Use `responseMimeType: "application/json"` and pass the JSON schema derived from the Zod schema as `responseSchema` so output is structured. On 429 or quota errors, back off exponentially (30s, 2m, 8m), then hand the ticket to the fallback provider if `LLM_FALLBACK_PROVIDER` is set, else set the ticket to `brief_ready`.
- **`groq`** (optional fallback): Groq free tier, OpenAI-compatible endpoint, `GROQ_API_KEY`, `GROQ_MODEL`. JSON mode. Only used when `LLM_FALLBACK_PROVIDER=groq`.
- **`manual`**: makes no network call. Sets the ticket to `brief_ready` and stores `brief_system_prompt` and `brief_user_prompt` on the ticket. See 4.3.

Select via `LLM_PROVIDER` env (`gemini | groq | manual`). Do not add any other adapter.

**Rate limiting and cap** (`lib/generation/quota.ts`):
- Global queue: at most 1 LLM request every `LLM_MIN_INTERVAL_SECONDS` (default 10)
- Hard daily cap `LLM_DAILY_REQUEST_CAP` (default 40) across all providers, counted in `llm_usage`; when reached, generation stops, remaining tickets stay `open`, and one Telegram message goes to the admin
- Every call records tokens and request count in `llm_usage`
- `AUTOMATION_ENABLED=false` makes every provider behave as `manual`

### 4.3 `run-generation` (every 30 minutes, processes up to 5 tickets in `open` or `changes_requested` status by priority)

For each ticket, build the prompts, call the provider, validate the JSON against the Zod schema, retry once on validation failure with the validation errors appended, then mark `failed` with `last_error` if still invalid.

**Manual path** (`brief_ready` tickets): on the Tickets page, "Copy brief" copies `brief_system_prompt + "\n\n---\n\n" + brief_user_prompt` to clipboard so I can paste it into claude.ai or any chat model. "Paste response" accepts the returned JSON (strip ```json fences before parsing), validates against the same Zod schema, shows validation errors inline, and on success continues exactly like an API-generated draft with `generation_meta.source: manual`. Every ticket, regardless of provider, must show these controls as a fallback.

Create `lib/generation/prompts/` with one prompt file per ticket type, each versioned (`PROMPT_VERSION` constant recorded into `generation_meta.prompt_version`). All prompts share a **system prompt** built from `config/brand-style-guide.md` (create this file with the content in Appendix C; I will edit it later) plus the following hard rules:

- Write in clear Indian English for a general adult audience; short sentences; no jargon without a one-line explanation.
- Open with a 40–60 word direct answer to the page's core question (goes into `answer_summary`).
- Use question-form H2 headings where natural.
- Include specific, concrete facts: durations, ranges, steps, price ranges in INR where the style guide provides them; never invent prices, clinical statistics, or brand model names.
- Every medical claim must be attributable to a source in the `sources` array; prefer WHO, Indian Speech and Hearing Association, ASHA, peer-reviewed journals, manufacturer documentation. If no reliable source is known, phrase conservatively and add a `[REVIEWER: verify]` marker in the body.
- Never diagnose, never promise outcomes, never disparage competitors.
- Include 5–8 FAQ items with 40–80 word answers.
- Suggest 3–6 internal links by slug from the provided list of existing pages.
- Never claim the content has been reviewed by anyone.
- Respond with a single JSON object matching the given schema and nothing else.

The user prompt for each ticket includes: the ticket reason and evidence, target keywords, the list of existing published slugs with titles (for internal linking), the existing page content for refresh/add_faq types, any `review_notes` from a previous cycle, and the relevant Appendix C section for the page type.

Per-type output schemas (define as Zod):

- `new_page` → `{ slug, page_type, title, meta_title, meta_description, answer_summary, body_markdown, faq_items[], sources[], internal_links[], target_keywords[] }`
- `refresh` → same as new_page plus `change_summary` (bullet list of what changed and why; shown to the reviewer)
- `add_faq` → `{ faq_items[] }` to append
- `meta_rewrite` → `{ variants: [{ meta_title, meta_description, rationale }] }` with exactly 3 variants; store on the ticket, reviewer picks one
- `fix_schema` → no LLM call; run the schema builder from Phase 2 and store the result as a draft change
- `review_reply` → `{ reply_text, tone, escalate: boolean, escalation_reason }`; rules: thank by first name if available, mention the clinic, ≤ 60 words, no medical advice, for ratings ≤ 3 always `escalate: true`
- `gbp_post` → `{ post_text (≤ 300 chars), cta_type, cta_url, suggested_topic }`, generated from that clinic's recent content publishes, offers config, and season (World Hearing Day, Diwali, senior citizen camps, monsoon ear-care, etc.)

After generation: create the CMS draft page (or attach the proposal to the ticket for meta/faq/gbp types), set the ticket to `draft_ready`, generate `json_ld` via the Phase 2 builders, emit `ticket.draft_ready`.

### 4.4 Review replies special path

On `review.received`:
- rating 4–5 → generate reply, **auto-publish** via the GBP API, set `reply_status: auto_published`, Telegram the clinic manager "Replied to a 5★ review at {clinic}: '{reply_text}'". If the LLM cap is reached or provider is manual, create a `review_reply` ticket instead (never auto-publish a non-AI placeholder).
- rating 1–3 → generate reply draft, create `review_reply` ticket assigned to the clinic manager, Telegram marked **URGENT** with the review text and a link to the review screen; email copy to `ESCALATION_EMAIL`.
- Manager can edit and publish from the CMS; publishing calls the GBP API.

### 4.5 Approval flow

- `ticket.draft_ready` → notify assigned reviewer via Telegram + email (Phase 5), set ticket `in_review`.
- `ticket.brief_ready` → notify the admin via Telegram: "Ticket #{id} needs a manual draft. Open: {link}".
- Reviewer actions in the CMS: Approve, Request Changes, Dismiss.
- **Request Changes** with notes → ticket `changes_requested` → `run-generation` picks it up again with the notes appended to the prompt (max 2 automatic revision cycles, then it stays with the human).
- **Approve** → `reviewed_by_id`, `reviewed_at`, `status: approved` → publish immediately (or at a scheduled time if the reviewer sets one) → `status: published` → emit `page.published`.
- Every reviewer field edit before approval writes to `review_edits`.

### 4.6 Publish side effects (subscribe to `page.published` / `page.updated`)

In order, each logged, each failure non-blocking for the others:
1. Call Next.js `/api/revalidate` for the page, hub, sitemap, llms.txt
2. Ping IndexNow (`INDEXNOW_KEY`) with the URL
3. Call Google Indexing API `URL_UPDATED` (service account; officially for JobPosting/BroadcastEvent, so treat as best-effort and log the response)
4. If page type is `clinic` or the ticket was `gbp_post`, publish the GBP post via the API
5. Post a one-line notice to Telegram admin chat and, if `SLACK_WEBHOOK_URL` is set, to Slack

**Verification for Phase 4**: seed fake GSC rows that trigger rule 1; run the decision engine; a ticket appears; run generation with `LLM_PROVIDER=gemini`; a draft page appears in the review queue with valid JSON-LD and `llm_usage` shows 1 request; set `LLM_PROVIDER=manual`, run again on another ticket, copy the brief, paste a valid JSON response, and the same draft flow completes; reviewer gets notified; approving publishes and the revalidate/IndexNow calls are logged.

---

## Phase 5: Notifications

Create `lib/notifications/` with a single `notify(recipient, type, payload)` function that dispatches to channels based on type and recipient preferences, and records into `notifications`.

### 5.1 Telegram

Telegram Bot API (`TELEGRAM_BOT_TOKEN`, free). Add a `/start` handler (webhook route `POST /api/telegram/webhook` protected by `TELEGRAM_WEBHOOK_SECRET`) that, when a team member sends `/start {one-time-code}` (code shown on their CMS profile), links their `telegram_chat_id`. Also an `TELEGRAM_ADMIN_CHAT_ID` for system alerts. Messages (plain text, Markdown V2 escaped properly):

- `draft_ready`: "Hi {name}, a new {type} draft is ready for your review: {title}\nWhy: {reason}\nReview: {link}"
- `brief_ready`: "Ticket #{id} ({type}) needs a manual draft. Open: {link}"
- `review_urgent`: "URGENT: {rating}★ review at {clinic}\n\"{excerpt}\"\nA reply draft is waiting: {link}"
- `review_auto_replied`: "Replied to a {rating}★ review at {clinic}: \"{reply}\""
- `review_nudge`: "Hi {name}, {clinic} has had {count} Google reviews in the last 30 days. Share this link with happy patients: {review_link}"
- `escalation`: "Reminder: {count} drafts have been waiting more than 7 days. Oldest: {title}. Queue: {link}"
- `quota_reached`: "Daily LLM cap ({cap}) reached. {n} tickets waiting. They will resume tomorrow or can be done manually: {link}"
- `manual_ai_check_due`: "Monthly AI visibility check is due. Takes ~20 minutes: {link}"

### 5.2 Email

Use the existing email provider; if none, add Resend or Brevo on their free tier (`EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`). Templates (React Email or plain HTML, matching existing conventions):
- Daily digest 09:00 IST per reviewer: all items pending for them, grouped by type, with age and deep links; skip if empty
- Weekly report and monthly report (Phase 6)
- Dev alert for technical issues
- Escalation to `OWNER_EMAIL` for items > 7 days old

Keep total email volume well under any free-tier limit; the digest approach (one email per reviewer per day) is deliberate.

### 5.3 In-CMS

A notification bell with unread count on the admin layout, reading from `notifications` where `channel = in_app`.

**Verification for Phase 5**: link a Telegram account via `/start`; trigger a draft; the reviewer receives Telegram and email within one minute; the daily digest runs and lists it; after 7 days (simulate by changing timestamps) the escalation fires.

---

## Phase 6: Reporting

### 6.1 `weekly-report` (Monday 08:00 IST)

Compute for the last 7 days vs prior 7 days: organic clicks and impressions (GSC), top 10 gaining and losing queries, top 10 gaining and losing pages, GBP calls/directions/website clicks per clinic, new reviews and average rating per clinic, AI citation rate (% of question-engine pairs where we were cited, auto + manual) with a per-engine breakdown and which competitors were cited most, CWV status per key URL, tickets created / drafts published / drafts pending with median review time, `review_edits` count, LLM requests used vs cap. Render as an HTML email + a page in the CMS. Post a 5-line summary to Telegram admin chat.

### 6.2 `monthly-report` (1st of the month, 08:00 IST)

Same metrics over 30 days, plus a narrative section generated through the LLM provider (one request, counts toward the cap; falls back to a templated summary if the cap is reached): 200–300 words summarising what moved, what worked, and 3 recommended actions, grounded only in the numbers supplied to it (pass the computed metrics as JSON; instruct it not to invent figures). Include a "prompt improvement" section: cluster the month's `review_edits` by field and list the recurring corrections so I can update the style guide.

### 6.3 Attribution

Add a required "How did you hear about us?" field to the appointment booking form (options: Google search, Google Maps, ChatGPT/AI assistant, referral, walk-in, social, other) and store it with the lead; include the breakdown in both reports.

**Verification for Phase 6**: run both reports manually with real data; the emails render on mobile; numbers match a manual GSC check for one query.

---

## Phase 7: Hardening and handover

- Rate limiting and retries with exponential backoff on every external API; respect quotas (GSC 1,200 req/min project-wide, PSI free-tier daily quota, GBP per-location limits, Gemini free-tier RPM/RPD as shown in AI Studio for this project, Reddit 100 req/min).
- Cost guard: `LLM_DAILY_REQUEST_CAP` is enforced in one place (`quota.ts`) and every provider goes through it. Add a test proving that a loop of 1,000 tickets makes at most `cap` requests.
- Kill switch: `AUTOMATION_ENABLED=false` stops all jobs from making changes or LLM calls (they still log what they would have done).
- Dry-run mode for the decision engine and generation: writes tickets and drafts but sends no notifications.
- Backfill script: import 16 months of GSC history on first run.
- Seed script: team members, clinics, probe questions, seed keywords, thresholds.
- `docs/automation.md`: architecture diagram (Mermaid), job schedule table, env var reference (grouped: required / optional / fallback), a "first-time setup" checklist (create Gemini key in AI Studio **without attaching a billing account**, create GSC and GBP service accounts, create the Telegram bot with BotFather, add GitHub secrets), runbook for common failures (429s, expired service account, GBP auth), and a "how to add a new rule" guide.
- Tests: unit tests for every decision rule with fixture data; contract tests for each external API adapter using recorded responses; an end-to-end test that runs the full ticket → draft → approve → publish chain against a test database, once with the `gemini` adapter mocked and once with the `manual` path.

---

## Appendix A: Seed AI probe questions

1. What is the best hearing aid for an elderly person in India?
2. How much do hearing aids cost in India?
3. What is a pure tone audiometry test and how long does it take?
4. What is a BERA test and who needs it?
5. What is the difference between OAE and BERA tests?
6. What is tympanometry used for?
7. Which is better, BTE or RIC hearing aids?
8. Are rechargeable hearing aids worth it?
9. Can hearing aids help with tinnitus?
10. How do I know if I need a hearing test?
11. What happens during a hearing test?
12. Where can I get a hearing test near me?
13. Which hearing aid brands are available in India?
14. How long do hearing aids last?
15. Do hearing aids work for severe hearing loss?
16. What is the difference between a hearing aid and a cochlear implant?
17. Is sudden hearing loss an emergency?
18. Can children get hearing aids?
19. How often should I get my hearing tested after 60?
20. What is a hearing aid trial and is it free?

## Appendix B: Seed keywords (for question harvesting and competitor matching)

hearing aid, hearing aids price, hearing aid cost, hearing test, audiometry, pure tone audiometry, PTA test, BERA test, OAE test, tympanometry, impedance audiometry, speech audiometry, hearing loss, sensorineural hearing loss, conductive hearing loss, tinnitus, hearing aid brands, BTE hearing aid, RIC hearing aid, CIC hearing aid, invisible hearing aid, rechargeable hearing aid, Bluetooth hearing aid, hearing aid for seniors, hearing aid for children, audiologist near me, hearing clinic near me, hearing aid trial, hearing aid repair, hearing aid batteries, cochlear implant, ear wax removal, hearing aid fitting

## Appendix C: Brand style guide (starter, in `config/brand-style-guide.md`)

- Brand: Hearing Hope. Tone: warm, reassuring, plain-spoken, expert without being clinical. We talk to patients and their families, often adult children researching for a parent.
- Always use "hearing aid" (two words), "audiologist", "hearing test". Avoid "deaf" as a descriptor of patients; use "hearing loss".
- Prices: give ranges in INR only when supplied in the page brief; otherwise say "prices vary by technology level; a consultation includes a quote" and add `[REVIEWER: add price range]`.
- Every test page must cover: what it is, who it is for, what to expect step by step, duration, preparation, what results mean, next steps, cost note, FAQ.
- Every product page must cover: who it suits, key features, styles available, battery/charging, connectivity, trial and warranty policy, FAQ.
- CTA on every page: book a free hearing consultation at the nearest clinic.
- Never mention competitor clinic names. Manufacturer brand names are fine when we stock them.
- Reading level: aim for roughly grade 8.

## Appendix D: Environment variables summary

Required: `GEMINI_API_KEY`, `GEMINI_MODEL`, `LLM_PROVIDER=gemini`, `LLM_DAILY_REQUEST_CAP=40`, `LLM_MIN_INTERVAL_SECONDS=10`, `AUTOMATION_ENABLED=true`, `INTERNAL_API_TOKEN`, `CRON_SECRET`, `REVALIDATE_SECRET`, `SITE_URL`, `SITE_DOMAIN`, `GSC_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL`, `GBP_SERVICE_ACCOUNT_JSON`, `PSI_API_KEY`, `INDEXNOW_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_ADMIN_CHAT_ID`, `OWNER_EMAIL`, `ESCALATION_EMAIL`, `DEV_ALERT_EMAIL`, `COMPETITOR_DOMAINS`

Optional: `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `SLACK_WEBHOOK_URL`, `LLM_FALLBACK_PROVIDER`, `GROQ_API_KEY`, `GROQ_MODEL`

---

End of prompt. Start with Phase 0.
