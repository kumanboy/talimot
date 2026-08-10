# Admin performance fix

This patch reduces PostgreSQL work on the two slow admin routes.

## /admin/users
- Before: two database queries ran concurrently (global stats + filtered records).
- Now: one lightweight user-directory query is executed, then counts and filters are derived in memory.
- The current cap is 1000 users. Add cursor pagination before exceeding that size.

## /admin/tests
- Before: the catalogue selected the complete `payload` JSONB for each draft, including every question.
- Now: the catalogue selects only columns displayed in the table and extracts four small metadata values from JSONB.
- A second `COUNT(*)` query is skipped unless the current page is full.

## Diagnostics
Vercel logs now include:
- `[admin/users] directory query started/completed`
- `[admin/tests] summary query started/completed`

If a route still hangs, the start/completed pair shows whether the delay is inside PostgreSQL rather than rendering/session validation.
