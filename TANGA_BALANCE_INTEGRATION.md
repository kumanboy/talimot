# TA’LIMOT — Tanga balance integration

This step connects the existing `tanga_wallets` database table to the student UI.

Implemented:
- Drizzle schemas for `tanga_wallets` and `tanga_transactions`.
- `GET /api/tanga/wallet` authenticated by `talimot_student_session`.
- Active-user check before returning wallet data.
- Shared `useTangaWallet()` client hook.
- Real balance on `/profil` instead of hard-coded `0 Tanga`.
- Real balance on `/packages` instead of hard-coded `0 Tanga`.

No Tanga purchase or admin credit/debit action is added in this step.
