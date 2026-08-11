# TA'LIMOT Tanga payment workflow

This version adds:

- human-friendly numeric `user_number` for each registered user (starts from 5700);
- admin Tanga search by user number or phone;
- the public number is displayed in admin Tanga screens;
- real UZCARD payment card details in the Tanga purchase modal;
- purchase Telegram message includes tariff, amount, UZCARD card, user number, full name and phone;
- admin manual credit/debit form has a source selector and optional receipt/reference field;
- after a successful admin Tanga adjustment, the Telegram bot sends a best-effort notification to the user.

Run `TANGA_PAYMENT_IDENTITY.sql` in Supabase before deploying this code.
