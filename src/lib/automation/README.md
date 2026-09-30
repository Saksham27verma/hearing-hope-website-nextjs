# Automation module

Phase 1 foundations for the SEO / AEO / GEO queue. The public catalog tables stay as they are. New drafts live in `content_pages` and can point at an existing `blog_posts`, `products`, `clinical_services`, or `clinics` row through `source_table` and `source_id`.

- `content-rules.ts` decides what the internal API is allowed to write. It always creates drafts, refuses `reviewed_by_id` / `reviewed_at`, and refuses any status past `in_review`.
- `events.ts` is the in-process bus. Later phases subscribe to `page.published` and the other event names.
- `schema-validate.ts` is the check behind the review screen Validate button.
- Route handlers under `src/app/api/internal` use `INTERNAL_API_TOKEN`. Approve and request-changes reject that token and require a signed-in reviewer (`team_members.auth_user_id` + `is_reviewer`).
- Jobs and the internal API write with `SUPABASE_SERVICE_ROLE_KEY`. The admin UI keeps using the signed-in Supabase session.

Apply `supabase/migrations/20260929140000_seo_automation.sql` before using the queue.
