# TA’LIMOT — Diagnostika Rasch Analytics

## Deployment order (important)

1. **BEFORE deployment:** run `DIAGNOSTIC_RASCH_ANALYTICS_FOUNDATION.sql` in the production PostgreSQL/Supabase SQL editor.
2. Confirm the table `diagnostic_attempt_item_results` exists.
3. Deploy this application version to Vercel.
4. Complete one diagnostic with a test student account.
5. Open `/admin/results` and select that diagnostic.

Do not deploy the application code before the SQL table exists: the diagnostic completion endpoint now saves authoritative item-level results in the same completion flow.

## What is stored

For questions 1–39, one item result is stored per question. Multipart questions 40–44 are stored as separate item keys such as `40a`, `40b`, ..., `44a`, `44b`. Q45 is display-only and is not included.

The server persists verdicts only after recalculating the diagnostic from the trusted published test definition. Browser-calculated correctness is not trusted.

## Admin analytics

`/admin/results` now provides:

- diagnostic selector;
- total attempts and unique users;
- latest user-level grade distribution;
- correct answers per item;
- Rasch item difficulty logits;
- hardest/easiest item rankings;
- exact per-item table with N, correct, incorrect, unanswered, correct %, difficulty and standard error.

### Rasch formula used

The supplied reference graphs use the observed item p-value transform:

`b = ln((1 - p) / p)`

where `p` is the proportion of users answering correctly.

- positive `b` = harder;
- `b = 0` = 50% correct;
- negative `b` = easier.

A 0.5 continuity correction is used only when every user gets an item correct or every user gets it wrong, preventing infinite logits.

## Repeat attempts

For item/Rasch analysis, each user contributes only their earliest attempt that has persisted item-level data. This prevents repeated practice attempts from overweighting a single user.

## Historical attempts

Attempts completed before this feature did not store per-question results, so they cannot be reconstructed from summary scores alone. They remain visible in overall attempt/grade statistics. If old raw answer exports become available later, they can be backfilled separately.
