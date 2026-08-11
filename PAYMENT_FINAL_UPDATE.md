# TA'LIMOT — payment final update

## Manual UZCARD payment

A single shared payment configuration is now used by:

- Tanga packages;
- Book purchases;
- Course purchases.

The card number, card holder, payment method and Telegram support username are defined once in:

`src/features/payments/config/manual-payment.ts`

This prevents payment details from drifting between purchase flows.

## Final Tanga pricing shown to students

- Pullik mavzu testi — 1 Tanga
- Diagnostika / mock testi — 2 Tanga
- AI esse tekshiruvi — 3 Tanga
- Ustoz esse tekshiruvi — 6 Tanga

Packages:

- Boshlang'ich — 7 Tanga / 20 000 so'm
- Standart — 16 Tanga / 40 000 so'm
- Maksimal — 36 Tanga / 80 000 so'm

The package page now explains what each package can be used for and explicitly states that Tanga cannot be used to buy courses or books.
