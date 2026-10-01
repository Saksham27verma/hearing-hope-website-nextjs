# Hearing Hope SEO automation

The automation creates tickets and drafts only. A page becomes public only when a signed-in team member with `is_reviewer = true` presses **Approve**. That action is the sole writer of `reviewed_by_id` and `reviewed_at`; condition, test, and product pages therefore always display the human reviewer and approval date.

```mermaid
flowchart LR
  S[Free signals] --> D[12 deterministic rules]
  D --> T[Open content ticket]
  T --> G[Gemini/Groq or manual brief]
  G --> Q[Draft review queue]
  Q -->|Reviewer approves| P[Published page]
  P --> R[Revalidate, IndexNow, GBP post, notice]
  R --> M[Weekly/monthly reports]
```

## First-time setup

1. Apply `supabase/migrations/20260929140000_seo_automation.sql` and the later reporting migration in the Supabase SQL editor. Create a `team_members` row linked to the reviewer’s Supabase Auth UUID, with `is_reviewer=true`.
2. Add every variable in `.env.example` to the deployment environment. Generate the local internal secrets with `openssl rand -hex 32`; do not expose service-role, OAuth, LLM, or Telegram values to the browser.
3. Gemini: create an API key in the no-billing Google Cloud project, set `GEMINI_API_KEY`, and retain `LLM_DAILY_REQUEST_CAP` and `LLM_MIN_INTERVAL_SECONDS`. Quota errors stop/retry and never purchase capacity.
4. GSC: create a service account, grant it Search Console access for `GSC_SITE_URL`, and store its complete JSON in `GSC_SERVICE_ACCOUNT_JSON`. Run `npm run automation:backfill-gsc` once for the permitted 16-month history.
5. GBP: request/enable the Business Profile APIs for the owner’s Google account, complete the OAuth consent flow with the approved redirect URI, then set `GBP_OAUTH_CLIENT_ID`, `GBP_OAUTH_CLIENT_SECRET`, and the long-lived `GBP_REFRESH_TOKEN`. No service account is used for GBP.
6. Telegram: create the bot in BotFather, set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and `TELEGRAM_ADMIN_CHAT_ID`, then register `/api/telegram/webhook` with the secret header. Each reviewer sends `/start` once to link their chat.
7. Add all secrets to the GitHub Actions repository secrets and enable `.github/workflows/scheduled-jobs.yml`. The schedule is written in UTC with comments showing IST.
8. Run `npm run automation:seed` to idempotently seed the four live clinics and 20 active probe questions. It does not create public content. Set `AUTOMATION_DRY_RUN=true` for a rehearsal that writes tickets/drafts but suppresses notification effects; set `AUTOMATION_ENABLED=false` for a complete no-write/no-LLM stop.

## Operations and recovery

- All REST adapters retry only temporary network, 408/425/429, and 5xx failures with 1 s, 5 s, and 25 s delays. Gemini quota retries use 30 s, 2 min, and 8 min. Permanent 4xx and validation errors are surfaced immediately in `job_runs`.
- For a failed job, inspect `/admin/automation` and `job_runs`, correct the missing credential or data issue, then use the job route with `CRON_SECRET` or the workflow’s `workflow_dispatch`. Re-running is safe because signal writes and seeds are UPSERTs.
- For an LLM incident, leave drafts unpublished, set `AUTOMATION_ENABLED=false`, then either use Groq only if its free-tier key is configured or choose the Manual brief and paste validated JSON into the CMS.
- For GBP OAuth failures, revoke and repeat the consent/refresh-token setup; never substitute a service account. For an IndexNow or revalidation failure, the page remains published and the non-blocking failure is logged for replay.
- To add a new rule, add a pure function in `src/lib/decisions/rules`, register it in `index.ts`, add a fixture assertion, keep dedupe in `runDecisionEngine`, and never bypass the review queue.

## Routine schedule

Search Console, PageSpeed, questions, GBP, and competitor signals feed the daily/weekly job cadence. Decision and generation jobs create reviewable work; daily digests and 7-day escalation follow. The weekly report is concise, and the monthly report includes attribution. Live keys are required only for external calls; recorded-response tests cover the contract without them.
