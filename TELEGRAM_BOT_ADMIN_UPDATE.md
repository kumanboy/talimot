# TA’LIMOT — Telegram bot admin + UX update

## Added

### 1. Bot commands
Private-chat command list:

- `/platforma` — opens TA’LIMOT only for an active registered TA’LIMOT user; required Telegram-channel membership is still checked before the platform link is sent.
- `/start` — registered users get a compact command menu; unregistered/unsubscribed users keep the existing subscription/onboarding flow.
- `/balans` — active registered users get their DB-backed Tanga balance and a secure signed button to `/packages`.

Admin > Telegram has a `Bot buyruqlarini o‘rnatish` action. Run it once after production deploy so Telegram stores the three commands globally for private chats.

### 2. Rasmli Telegram broadcast
New Admin route: `/admin/telegram`

- Upload JPG / PNG / WEBP up to 8 MB.
- Enter a caption up to 1000 characters.
- The server selects active TA’LIMOT users with a linked `telegram_chat_id` from the existing `users` table.
- The first successful send uploads the image once; later sends reuse Telegram's `file_id`.
- Delivery failures (blocked bot, invalid chat, Telegram error) do not stop the remaining recipients.
- The Admin UI reports total / sent / failed counts.

### 3. Payment approve / reject in Telegram
When a new `manual_payments` row is created for `tanga`, `book`, or `course`, the configured admin Telegram user receives a message with:

- payment code
- user name / phone / Telegram username
- payment kind
- title
- amount
- `✅ Tasdiqlash`
- `❌ Rad etish`

Both Telegram callbacks and Admin > To‘lovlar now use the same server-side payment processor.

Safety:

- callback sender must match the configured Telegram admin user ID;
- payment row is locked `FOR UPDATE`;
- only `pending` can be processed;
- duplicate callback clicks return `already_processed`;
- confirmed Tanga credits still use the existing atomic `apply_tanga_transaction(...)` DB function;
- Telegram notification delivery cannot roll back or falsely mark an already-committed payment as failed.

## Required Vercel environment variable

Add:

`TELEGRAM_ADMIN_USER_ID=<your Telegram numeric user ID>`

For backwards compatibility, existing `ADMIN_ID` is also accepted if present.

Existing values still required by the bot remain unchanged, including the bot token, webhook secret, app URL, and auth/session secret.

## SQL

**No new SQL migration is required.**

The update reuses the existing:

- `users`
- `manual_payments`
- `tanga_wallets`
- `tanga_transactions`
- `apply_tanga_transaction(...)`

## Deployment order

1. Add `TELEGRAM_ADMIN_USER_ID` in Vercel Production environment variables.
2. Deploy the updated project.
3. Open `/admin/telegram` on desktop.
4. Click `Bot buyruqlarini o‘rnatish` once.
5. Test `/start`, `/platforma`, `/balans` in the bot.
6. Create one small Tanga payment request and verify the admin bot receives Approve / Reject.
7. Approve it once; click Approve again and verify Tanga is not credited twice.
8. Create a course or book payment and test both Approve and Reject.
9. From `/admin/telegram`, send one test image post and verify registered Telegram-linked users receive image + caption as one Telegram post.

## Validation performed locally

- Changed TypeScript/TSX files parsed with the TypeScript parser: no syntax errors.
- Local `@/` and relative import resolution check passed.
- Targeted `git diff --check` for changed feature files passed.
- `npm ci` could not complete within the local execution timeout, so a full Next.js production build was not claimed. Vercel production build remains the final verification.
