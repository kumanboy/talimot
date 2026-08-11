# Payment build fix

- `manualPayments` is exported from `src/lib/database/schema/manual-payments.ts`.
- Payment routes import `manualPayments` and `users` directly from their schema files to avoid barrel-export resolution issues during Next.js/Vercel builds.
- `src/lib/database/schema/index.ts` also exports `manual-payments`.
- Payment method is UZCARD everywhere.
- New Tanga payment ledger source is `uzcard_payment`; legacy `humo_payment` history is still displayed as UZCARD payment for compatibility.
