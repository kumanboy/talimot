# TA’LIMOT v15 — real payment workflow

## What changed

- UZCARD card is treated as a real payment card for Tanga, books and courses.
- All visible DEMO card copy was removed.
- Fraud warning is shown in every manual-payment modal.
- Clicking “Telegram orqali tasdiqlash” now creates a `pending` payment request first.
- Telegram message includes a short `PAY-XXXXXXXX` payment ID.
- Admin sidebar now has `/admin/payments`.
- Admin can search by payment ID, user ID, phone, name, or Telegram username.
- Admin can filter by Tanga / Kitob / Kurs and payment status.
- Payment detail screen stores receipt/reference and admin note.
- Confirming a Tanga payment automatically credits the exact package amount atomically.
- Confirming/rejecting sends a Telegram notification when the user has a linked chat.
- Manual Admin → Tanga adjustment is now reserved for promo/corrections, preventing double-crediting real UZCARD payments.

## Deployment order

1. Run `PAYMENTS_FOUNDATION.sql` in Supabase SQL Editor.
2. Overlay/deploy this project update.
3. Test one Tanga purchase: packages → Telegram → admin payments → confirm → wallet balance.
4. Then test one book and one course payment request.
