# TA’LIMOT — Paid Test Step 2

This step connects published paid tests to the existing Tanga wallet.

## What is included

- Paid test cards show their Tanga price.
- Purchased tests show `Sotib olingan`.
- Clicking `Sotib olish` loads the current wallet balance and asks for confirmation.
- Insufficient balance offers a shortcut to `/packages`.
- `POST /api/tests/[testId]/purchase` performs the purchase on the server.
- The wallet row is locked during purchase to prevent double charging.
- Tanga debit and `test_purchases` insertion are committed in the same database transaction.
- A purchase is permanent for that user/test pair.
- Direct paid-test URLs are protected before the question payload is loaded.
- Tanga admin history labels `test_purchase` as `Test xaridi`.

## Database

No new SQL is required for Step 2 if `PAID_TEST_TANGA_FOUNDATION.sql` from Step 1 has already been run successfully.

## Smoke test

1. Keep the new test as `Pullik`, price `1 Tanga`.
2. Publish it from Admin.
3. Log in as a student with at least 1 Tanga.
4. Open the relevant test collection page.
5. Confirm the card says `1 Tanga` and button says `Sotib olish · 1 Tanga`.
6. Click it. Confirm the modal shows current balance, price and remaining balance.
7. Confirm purchase.
8. The test should open and the wallet should decrease by exactly 1 Tanga.
9. Return to the collection page. The badge should say `Sotib olingan` and the button `Testni boshlash`.
10. Re-open the direct test URL. It must open without charging again.
11. Try another account that has not purchased the test and paste the direct URL. The question payload must not open; the paid-access screen must be shown instead.
12. Try a student with 0 Tanga. Purchase must fail without creating a purchase or decreasing the balance.

## Important

Do not remove the Step 1 database migration. `test_purchases` and `admin_test_drafts.tanga_price` are required by this code.
