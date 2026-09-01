# TA’LIMOT — Telegram bot admin + payment UX update (v10.6.2)

## Included

### 1. Bot commands
Private-chat command list remains:

- `/platforma` — opens TA’LIMOT only for an active registered TA’LIMOT user; required Telegram-channel membership is still checked.
- `/start` — registered users get the compact bot menu; unregistered/unsubscribed users keep the existing onboarding flow.
- `/balans` — active registered users get their DB-backed Tanga balance and the TA’LIMOT button.

### 2. Admin Telegram target
Payment alerts are intended for:

`@husan_davronov`

The server now resolves this username to the existing `telegram_chat_id` / `telegram_user_id` in the TA’LIMOT `users` table. This means a separate numeric Telegram ID is no longer required when that Telegram account is already registered and linked to TA’LIMOT.

Optional overrides:

- `TELEGRAM_ADMIN_USERNAME=husan_davronov`
- `TELEGRAM_ADMIN_USER_ID=<numeric Telegram ID>` as a fallback
- legacy `ADMIN_ID` remains a fallback

Important Telegram rule: a bot cannot start a private conversation with a user who has never opened the bot. `@husan_davronov` should send `/start` to the TA’LIMOT bot at least once.

### 3. Payment request loading fix
Tanga, Book and Course payment request buttons no longer remain stuck on:

`So‘rov yaratilmoqda…`

Changes:

- the payment row is created in DB first;
- the buyer receives the API response immediately;
- admin Telegram notification runs with Next.js `after(...)`, so a slow Telegram Bot API does not block the buyer request;
- inside Telegram Mini App the app uses `Telegram.WebApp.openTelegramLink(...)` when available instead of depending only on `window.location.href`;
- local loading/lock state is released as soon as the DB payment request is successfully created.

### 4. Approve / Reject from admin phone
Every new `tanga`, `book`, or `course` manual payment sends the admin a Telegram message with:

- payment code
- buyer name
- phone
- Telegram username
- payment kind
- product/package title
- amount
- `✅ Tasdiqlash`
- `❌ Rad etish`

The callback accepts the configured numeric admin ID **or the exact Telegram username `@husan_davronov`**.

Both Telegram and Admin > To‘lovlar still use the same DB-backed processor:

- payment row is locked `FOR UPDATE`;
- only `pending` can be processed;
- duplicate callback presses cannot process the same payment twice;
- confirmed Tanga still credits through the existing atomic `apply_tanga_transaction(...)` function;
- user payment/Tanga notifications remain best-effort after commit.

## SQL

**No new SQL migration is required.**

Existing structures are reused:

- `users`
- `manual_payments`
- `tanga_wallets`
- `tanga_transactions`
- `apply_tanga_transaction(...)`

## Exact deployment / test order

1. Make sure the Telegram account `@husan_davronov` is the account linked to your TA’LIMOT user and send `/start` to the bot once.
2. Deploy this ZIP to Vercel.
3. In Admin > Telegram, click `Bot buyruqlarini o‘rnatish` if the commands have not already been installed.
4. Create a small Tanga request in Telegram Mini App. The loader must stop and Telegram chat should open.
5. Verify `@husan_davronov` receives the payment notification with `✅ Tasdiqlash / ❌ Rad etish`.
6. Approve the Tanga payment from the phone. Verify the wallet is credited once.
7. Press the old Approve button again. It must report that the payment was already processed and must not credit again.
8. Repeat with one Course request and one Book request; test both approve and reject.

## Local validation

- 401 TypeScript/TSX files parsed with TypeScript parser: 0 syntax errors.
- All local `@/` and relative imports resolve.
- Only targeted Telegram/payment files changed from v10.6.1.
- `npm ci` did not complete inside the local timeout, so a full Next.js production build is not claimed. Vercel production build remains the final verification.
