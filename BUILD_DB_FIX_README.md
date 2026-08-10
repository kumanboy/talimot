# Build / DB fix

1. Run `ADMIN_TEST_DRAFT_SUMMARY_COLUMNS.sql` in Supabase SQL Editor.
2. Deploy the code.

What changed:
- Public DB-backed collection routes call Next.js `connection()` before DB access, so `next build` no longer depends on live Postgres.
- Test summary metadata is stored in scalar columns instead of being extracted from the large JSONB payload on every list request.
- Topic pages query only the requested topic/format instead of loading the entire group.
- Composite index added for published test listings.
