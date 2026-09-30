# Cursor Prompt: Audit the SEO / AEO / GEO Automation Build and Complete What's Missing

Before pasting: put the original spec file (`cursor-prompt-seo-automation-v2.md`) in the repo at `docs/spec/seo-automation-spec.md` so Cursor can read it. Then paste everything below this line.

---

## Your task

The file `docs/spec/seo-automation-spec.md` is the specification you were given to build the SEO / AEO / GEO automation system for Hearing Hope. You have been working on it across multiple sessions. I need you to **audit the current state of the codebase against that spec, item by item, prove what works, and then build or fix whatever is missing.**

This is not a summary task. Do not tell me "Phase 1 is complete" based on memory or on file names. For every requirement, you either show evidence from the code and from running it, or you mark it missing.

**One spec change to apply during this audit**: Google Business Profile authentication must use the **OAuth 2.0 refresh-token flow** (`GBP_OAUTH_CLIENT_ID`, `GBP_OAUTH_CLIENT_SECRET`, `GBP_REFRESH_TOKEN`), not a service account. If the code uses a service account for GBP, replace it. Search Console can keep the service account.

## Rules for this audit

- Work through the checklist below in order. Do not skip sections.
- For each item, output one line in this format:
  `[PASS | PARTIAL | MISSING | BROKEN] <item> — <file path(s)> — <evidence>`
  where evidence is a command you ran and its result, a test that passed, a route you called, or a database row you created. "Code exists" is not evidence unless you also ran it.
- Actually run things: migrations, tests, job endpoints with the `CRON_SECRET`, the internal API with the `INTERNAL_API_TOKEN`, the Next.js build, a Lighthouse or equivalent check. Use a local or test database. If an external API cannot be called because a key is missing, mark it `PARTIAL (no key)` and prove the adapter works against a mocked or recorded response instead.
- After the full checklist, produce a **Gap Report**: every PARTIAL, MISSING, or BROKEN item, grouped by phase, ordered by the spec's own priority (Phase 1 gaps before Phase 5 gaps), with an estimate of effort (S / M / L).
- Then **stop and wait for my go-ahead** before fixing anything.
- When I say "fix", work through the Gap Report top to bottom. After each item, re-run its evidence check and update the line to PASS. Do not batch ten fixes and then test; fix one, prove one.
- Do not refactor working code, rename things, or change conventions while auditing. Fixes stay minimal and match existing patterns.
- If you find something built that the spec did not ask for and that violates the two non-negotiable rules (AI content published without human approval; any paid API adapter or missing daily cap), flag it as BROKEN at the top of the report regardless of phase.

---

## Checklist

### Non-negotiables (check first)

- N1. No path exists by which an AI-generated page reaches `status: published` without a human `approve` action. Grep for every write to `status`, `reviewed_by_id`, `reviewed_at`; list them; show that only the session-authenticated approve handler sets the last two.
- N2. The only exception is 4–5 star review replies. Show that 1–3 star replies cannot be auto-published (test with a seeded 3-star review).
- N3. No Anthropic, OpenAI, Perplexity, or SERP API adapter or dependency exists in `package.json` or the code. List every `lib/generation/providers/*` file.
- N4. `LLM_DAILY_REQUEST_CAP` is enforced in a single place and every provider passes through it. Run the test that proves 1,000 tickets produce at most `cap` requests.
- N5. `AUTOMATION_ENABLED=false` stops all jobs from writing changes or calling any LLM. Run one job with it false and show the job_runs row says dry/no-op.
- N6. `.env.example` lists every variable from Appendix D of the spec with a comment, and no real key is committed anywhere (grep for `AIza`, `sk-`, `ya29`, `-----BEGIN`).

### Phase 0: Discovery

- P0.1 The Phase 0 report exists in the repo (or in the chat history summary) and its stack description matches what you see now.

### Phase 1: Data model and CMS

Migrations and models:
- P1.1 Page model has every field in spec 1.1 (list them, tick each). `meta_title` ≤ 60 and `meta_description` ≤ 160 validated at the model or API layer (show the validation firing).
- P1.2 Each model in spec 1.2 exists with the listed fields: `team_members`, `clinics`, `content_tickets`, `signals_search_console`, `signals_gbp_reviews`, `signals_gbp_insights`, `signals_web_vitals`, `signals_ai_visibility`, `signals_competitors`, `signals_questions`, `ai_probe_questions`, `review_edits`, `job_runs`, `llm_usage`, `notifications`. For each, show the migration and one row inserted.
- P1.3 Unique constraints exist: `signals_search_console (date, page_url, query, country, device)`, `signals_gbp_reviews.gbp_review_id`, `signals_questions.normalized_question`.
- P1.4 `content_tickets.status` enum includes `brief_ready` and `content_tickets` has `brief_system_prompt` and `brief_user_prompt`.

Internal API:
- P1.5 Every route in spec 1.3 exists and responds. Call each with curl and the bearer token; paste status codes.
- P1.6 `POST /pages` with the automation token forces `status: draft` even if the body says `published`.
- P1.7 `PATCH /pages/:id` with the automation token rejects `status: approved`, `status: published`, `reviewed_by_id`, `reviewed_at` (show the 4xx responses).
- P1.8 `POST /pages/:id/approve` rejects the automation bearer token and accepts a session from an `is_reviewer` user; on success sets `reviewed_by_id`, `reviewed_at`, `status: approved`, then `published`, and emits `page.published`.

Event bus:
- P1.9 Events `page.published`, `page.updated`, `page.archived`, `review.received`, `review.reply_published`, `ticket.draft_ready`, `ticket.brief_ready`, `technical.cwv_regression` are defined and have at least one subscriber each (list subscribers).

CMS UI (open each screen and describe what renders; screenshot if the tooling allows):
- P1.10 Review Queue: sorted by priority, shows type, title, reason, age, reviewer; filters work.
- P1.11 Review screen: rendered preview + editable fields, ticket reason and evidence, collapsed JSON-LD with a working Validate button, Approve / Request Changes (with notes) / Dismiss. Approve has at most one confirmation.
- P1.12 Tickets page: list, dismiss, re-queue, "Generate now", and for `brief_ready` tickets a "Copy brief" button and "Paste response" textarea that validates JSON and shows errors inline.
- P1.13 Manual AI check page: probe questions with copy buttons, per-engine "cited" checkbox and competitor field, Save writes `signals_ai_visibility` rows with `source: manual`.
- P1.14 Patient questions form works on a phone-width viewport and writes to `signals_questions` with `source: staff`.
- P1.15 Signals dashboard shows the five cards and last 10 job runs.
- P1.16 Clinics and Team Members CRUD exist; `team_members` has `telegram_chat_id` and `is_reviewer`; `clinics` has `gbp_location_id`, `gbp_place_id`, `gbp_review_link`, `manager_id`.
- P1.17 Editing any field of an AI draft before approval writes a `review_edits` row per changed field (edit two fields, show two rows).

### Phase 2: Next.js SEO

- P2.1 `generateMetadata` exists on every content route (list routes) and reads from CMS fields with sensible fallbacks. Show the rendered `<head>` for one page of each type.
- P2.2 `/sitemap.xml` lists only published pages with `lastModified`; splits into an index above 5,000 URLs (show the code path).
- P2.3 `/robots.txt` allows `GPTBot`, `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Bingbot`, disallows `/admin` and `/api`, references the sitemap.
- P2.4 `/llms.txt` renders the summary, clinics, services, and top pages, and is regenerated on publish (publish a page, re-fetch, show the change).
- P2.5 `/{INDEXNOW_KEY}.txt` serves the key.
- P2.6 Every schema builder in spec 2.2 exists (`organization`, `medicalClinic`, `product`, `medicalTest`, `medicalCondition`, `article`, `faqPage`, `breadcrumbList`); the `<JsonLd>` component renders from the stored `json_ld` field; the validator flags a missing required property (show one failing and one passing case).
- P2.7 Templates for test/condition/product/comparison/guide render the 7-part structure in order; the "Medically reviewed by" line only appears when `reviewed_by_id` is set.
- P2.8 `POST /api/revalidate` requires `REVALIDATE_SECRET` and revalidates page, hub, sitemap, and llms.txt tags.
- P2.9 View-source of a test page contains the full article HTML (not a client shell). `next build` passes with no errors. Lighthouse SEO score is 100 on one sample page (or equivalent check if Lighthouse is unavailable).

### Phase 3: Signals and scheduling

- P3.1 `.github/workflows/scheduled-jobs.yml` exists with one cron entry per job at the correct UTC conversion of the IST times, plus `workflow_dispatch` with a job-name input. Paste the file.
- P3.2 Every job is a `POST /api/jobs/{name}` handler that rejects a missing or wrong `CRON_SECRET` (show 401) and returns a JSON summary on success.
- P3.3 Each job writes a `job_runs` row with `items_processed`, `llm_requests_used`, and `errors`.
- P3.4 `sync-search-console`: pulls 3 days with the 5 dimensions, upserts, re-run creates no duplicates (show row count before and after two runs). URL inspection for recently published pages is implemented.
- P3.5 `sync-gbp`: uses the OAuth refresh-token flow; lists locations, upserts reviews, upserts insights, emits `review.received` for new reviews. Prove with a mocked response if no token yet.
- P3.6 `sync-web-vitals`: reads the 20-URL config, stores mobile + desktop, emits `technical.cwv_regression` when a previously passing page fails a threshold (seed a passing row, then a failing one, show the event).
- P3.7 `sync-competitors`: follows sitemap indexes, diffs, inserts new URLs with `first_seen_at`, fetches titles at ≤ 1 req/s with a custom user agent and robots.txt respect.
- P3.8 `probe-ai-visibility`: Gemini only, grounding enabled, cited URLs parsed from grounding metadata (not regex on prose), `our_domain_cited` set correctly, counts against the cap.
- P3.9 `harvest-questions`: pulls GSC question-queries, Reddit via the free API, and staff questions; normalises and dedupes; increments `seen_count`.
- P3.10 Monthly Telegram reminder for the manual AI check is scheduled.

### Phase 4: Decision engine, generation, approval

Decision engine:
- P4.1 `lib/decisions/rules/` has one pure function per rule 1–12; `config/decision-thresholds.ts` exists with every threshold used.
- P4.2 Unit test per rule with fixture data, all passing (paste the test run output).
- P4.3 Duplicate-ticket prevention: run the engine twice on the same data, show ticket count unchanged and `evidence`/`priority_score` updated.
- P4.4 Reviewer assignment: YMYL → audiologist round-robin, clinic/gbp/meta → marketing, technical → admin (show three tickets with correct assignees).
- P4.5 Rule 10 sends a Telegram nudge with the clinic's `gbp_review_link`; rule 11 emails `DEV_ALERT_EMAIL`.

Provider layer:
- P4.6 `LlmProvider` interface matches the spec; adapters `gemini`, `groq`, `manual` exist and nothing else.
- P4.7 Gemini adapter: uses `@google/genai`, `GEMINI_MODEL` from env with a free-tier Flash default documented in `.env.example`, `responseMimeType: application/json` with `responseSchema` derived from Zod, exponential backoff on 429 (30s, 2m, 8m), then fallback provider or `brief_ready`.
- P4.8 `quota.ts`: global min interval, daily cap, `llm_usage` rows per day per provider, Telegram `quota_reached` message when hit.
- P4.9 Manual provider sets `brief_ready` and stores both prompts on the ticket.

Generation:
- P4.10 `run-generation` processes ≤ 5 tickets per run by priority from `open` and `changes_requested`; validates output with Zod; retries once with validation errors appended; marks `failed` with `last_error`.
- P4.11 A prompt file per ticket type exists with a `PROMPT_VERSION` constant recorded into `generation_meta.prompt_version`. The shared system prompt loads `config/brand-style-guide.md` and includes every hard rule from spec 4.3 (grep for each).
- P4.12 Zod schemas for all seven output types match the spec; `meta_rewrite` enforces exactly 3 variants; `fix_schema` makes no LLM call.
- P4.13 End-to-end with Gemini: seed GSC rows that trigger rule 1 → engine creates ticket → generation creates a draft page with valid `json_ld` → `llm_usage` shows 1 request → reviewer notified → approve → published → revalidate and IndexNow calls logged. Paste the trail.
- P4.14 End-to-end with manual: same, but via Copy brief / Paste response; `generation_meta.source` is `manual`.
- P4.15 Request Changes with notes re-queues the ticket, the notes appear in the next prompt, and after 2 automatic cycles it stops re-generating.

Reviews:
- P4.16 4–5 star: reply generated, published via the GBP API (mocked if no token), `reply_status: auto_published`, manager gets Telegram. When the cap is hit or provider is `manual`, a `review_reply` ticket is created instead and nothing is auto-published.
- P4.17 1–3 star: draft only, ticket assigned to clinic manager, URGENT Telegram, email to `ESCALATION_EMAIL`; manager can edit and publish from the CMS.

Publish side effects:
- P4.18 On `page.published`: revalidate → IndexNow → Google Indexing API (best-effort) → GBP post if applicable → Telegram/Slack notice; each step logged; a failure in one does not block the next (make IndexNow fail, show the rest still ran).

### Phase 5: Notifications

- P5.1 `notify()` is the single entry point; every call records a `notifications` row with status and error.
- P5.2 Telegram: `POST /api/telegram/webhook` checks `TELEGRAM_WEBHOOK_SECRET`; `/start {code}` links `telegram_chat_id` (show the one-time code on a profile, run the flow, show the linked id); `TELEGRAM_ADMIN_CHAT_ID` receives system alerts; Markdown V2 escaping is correct for titles containing `.`, `-`, `(`, `!`.
- P5.3 All eight Telegram message types from spec 5.1 exist with the specified wording.
- P5.4 Email: provider configured (existing or free tier); daily digest per reviewer at 09:00 IST, skipped when empty; escalation to `OWNER_EMAIL` after 7 days (simulate by backdating).
- P5.5 In-app bell with unread count.

### Phase 6: Reporting

- P6.1 `weekly-report`: computes every metric in spec 6.1, renders an HTML email and a CMS page, posts a 5-line Telegram summary. Run it and paste the summary.
- P6.2 `monthly-report`: same over 30 days plus the LLM narrative grounded on supplied JSON (show the prompt forbids invented figures), falls back to a templated summary when the cap is hit, and includes the `review_edits` clustering section.
- P6.3 Booking form has the required "How did you hear about us?" field with the seven options; it's stored with the lead and appears in both reports.

### Phase 7: Hardening

- P7.1 Backoff and quota respect on every external adapter (list each adapter and its retry policy).
- P7.2 Dry-run mode for engine and generation.
- P7.3 GSC 16-month backfill script exists and runs.
- P7.4 Seed script creates team members, 4 clinics (Rohini, Green Park, Sanjay Nagar Ghaziabad, Indirapuram), 20 probe questions, seed keywords, thresholds.
- P7.5 `docs/automation.md` has the Mermaid architecture diagram, job schedule table, env var reference, first-time setup checklist (Gemini key without billing, GSC service account, GBP OAuth consent + refresh token, BotFather, GitHub secrets, GBP API access request form), runbook, and "add a new rule" guide.
- P7.6 Test suite: unit tests per rule, contract tests per adapter with recorded responses, both end-to-end tests. Paste the full test run summary with counts.

---

## Output format

1. The checklist above with one `[STATUS]` line per item, in order.
2. The **Gap Report** (grouped by phase, prioritised, S/M/L effort).
3. A one-paragraph honest overall assessment: what percentage of the spec is proven working, and the three biggest risks.
4. Stop. Wait for "fix".

When fixing: for each gap, state the item ID, make the minimal change, re-run its evidence, print the updated `[PASS]` line, move to the next. At the end, re-run the full test suite and `next build`, and print the final checklist with every line's status.
