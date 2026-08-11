# TA’LIMOT — Admin Tanga module

This patch adds the first production Admin Tanga management module.

## Routes
- `/admin/tanga` — wallet directory, search, totals and latest 50 ledger records
- `/admin/tanga/[userId]` — single-user wallet, add/subtract form and latest 100 records
- `POST /api/admin/tanga/[userId]/adjust` — authenticated admin mutation endpoint

## Safety
- Uses the existing `apply_tanga_transaction(...)` PostgreSQL function.
- Balance changes are atomic and ledger-backed; app code does not update balance directly.
- Debit cannot push balance below zero.
- Amount is restricted to 1..1,000,000 per admin action.
- Admin session is required for both pages and mutations.
- Admin panel remains desktop-only via the existing `/admin` layout.
