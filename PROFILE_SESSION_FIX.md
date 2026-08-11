# TA’LIMOT profile/session fix

- Fixed the student login form so it performs real server-side password verification instead of frontend-only navigation.
- Added `/api/auth/login` which verifies the scrypt password hash and creates the secure HttpOnly student session cookie.
- Telegram signed Mini App entry now automatically creates/refreshes the student session for an already registered active Telegram user.
- Reopening the Mini App therefore does not require entering the password again.
- Profile and Tanga APIs continue to authenticate with the secure server cookie; no password or auth token is stored in localStorage.
- Profile redirects back to login instead of rendering empty fields when a real student session is missing.
