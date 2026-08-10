# Telegram phone verification

Flow implemented in this build:

1. User completes onboarding and opens `/auth/register`.
2. User enters first name, last name, father's name, Telegram phone number and password.
3. `POST /api/auth/register/start` creates a 20-minute registration challenge.
4. The page shows **Telegram botni ochish**.
5. Bot receives `/start verify_<challengeId>` and asks the same Telegram user to share their own contact.
6. Bot compares the shared Telegram phone number with the number entered on the website.
7. If they match, the bot sends a 6-digit code valid for 10 minutes.
8. User enters the code in the Mini App.
9. `POST /api/auth/register/verify` creates the real `users` row and a 30-day student session cookie.
10. User is redirected to the onboarding destination.

Before testing, run `TELEGRAM_REGISTRATION_SETUP.sql` in Supabase SQL Editor.

Required existing Vercel variables:

- `DATABASE_URL`
- `AUTH_SESSION_SECRET` (32+ characters)
- `TELEGRAM_VERIFICATION_BOT_TOKEN`
- `TELEGRAM_VERIFICATION_BOT_USERNAME` (for example `talimot_bot`, no @)
- `TELEGRAM_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL=https://talimot.vercel.app`
