# Scheduled signal jobs

`runJob` is the idempotent execution boundary for the Phase 3 signal jobs. It
records a `job_runs` start and completion row for every attempt, and each
adapter gets credentials only from environment variables.

| Job | Schedule (IST) | Inputs |
| --- | --- | --- |
| `sync-search-console` | 03:00 daily | `GSC_SERVICE_ACCOUNT_JSON`, `GSC_SITE_URL` |
| `sync-web-vitals` | 04:00 daily | `PSI_API_KEY`, `WEB_VITAL_URLS` |
| `harvest-questions` | Monday 07:00 | GSC signals, Reddit credentials, staff questions |

The public entry point is `POST /api/jobs/{name}` with `Authorization: Bearer
{CRON_SECRET}`. Use GitHub Actions `workflow_dispatch` for manual production
runs. Adapter contract tests use recorded responses, so a missing third-party
key never creates fake production signal rows.
