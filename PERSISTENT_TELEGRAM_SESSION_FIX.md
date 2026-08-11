# Persistent Telegram Mini App session fix

- Student auth stays in the existing secure HttpOnly cookie (30-day max age).
- No password or auth token is stored in localStorage.
- When the bot opens the signed Telegram Mini App entry URL, `/api/telegram/access` now checks the existing student session.
- Login is skipped only when the session user matches the same registered Telegram account and the account is active.
- If the session is missing, expired, belongs to another Telegram account, or the account is inactive, the existing login/onboarding flow remains unchanged.
