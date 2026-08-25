# Paid Test + Tanga — Step 1

This step adds the admin-side paid-test pricing foundation without changing the current student purchase flow yet.

## Added

- `admin_test_drafts.tanga_price`
- Admin create form: `Bepul / Pullik` + Tanga price
- Admin edit form: editable access + price while the draft is editable
- Admin tests table: displays `Pullik · N Tanga`
- Server validation: free = 0 Tanga; paid = 1–1000 Tanga
- `test_purchases` table with one purchase per `(user_id, test_id)`
- Link slot to the eventual Tanga debit transaction

## Deploy order

1. Open Supabase SQL Editor.
2. Run `PAID_TEST_TANGA_FOUNDATION.sql`.
3. Deploy this code.
4. In Admin → Tests, create/edit a test and verify the paid price persists.

Student-side debit/unlock is intentionally not enabled in Step 1. That is Step 2.
