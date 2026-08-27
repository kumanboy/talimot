# TA’LIMOT — Diagnostic v1 Deployment

## What this release adds

- Diagnostic tests can be **Bepul** or **Pullik**.
- Paid diagnostics reuse the existing permanent Tanga purchase engine; price is configurable in Admin.
- Questions **1–44** are scored server-side using the supplied Milliy sertifikat weights.
- The printed reference weights total **76 raw points**; TA’LIMOT normalizes the test part proportionally to **75**.
- Q45 is **display-only ESSE topic + rules**. There is no essay textarea/upload.
- Q45 contains an optional previous essay result (`0–75`) and the UI says **“Bu qism ixtiyoriy.”**
- Final score, when an essay score is supplied: **(Test qismi + Esse qismi) ÷ 2**.
- Levels: **A+ / A / B+ / B / C+ / C**.
- Certificate is created from a **server-authoritative DB result** and shown **first** after `Yakunlash`.
- Certificates are stored in PostgreSQL (`diagnostic_certificates`), not localStorage.
- Certificate identity (ism/familiya/otasining ismi) is snapshotted at issue time in the DB.
- Profile → Sertifikatlar reads certificates from the DB, so they remain available on another device/browser.
- New HomeDrawer page: **Natija hisoblagich** at `/hisoblagich`.

## 1. Database first

Before deploying the code, run:

`DIAGNOSTIC_CERTIFICATES_FOUNDATION.sql`

in **Supabase → SQL Editor**.

The SQL is safe to re-run and can also upgrade an earlier beta certificate table.

## 2. Deploy code

Use `talimotv10.3_diagnostic_v1_final.zip` as the code baseline.

`.env.local` is intentionally excluded. Keep the environment variables from your current working deployment.

Commit/push and deploy normally. Keep the existing Webpack Vercel build configuration.

## 3. Import the 05.04 diagnostic

Upload:

`05.04_DIAGNOSTIKA_UPLOAD_READY.docx`

through the Admin diagnostic DOCX importer.

Expected import summary:

- Test turi: Diagnostika
- 45 tasks total
- 44 scored tasks + 1 display-only essay topic
- 180 minutes
- Default access in the provided DOCX: Pullik
- Default price: 2 Tanga
- Raw scoring total: 76
- TA’LIMOT maximum after normalization: 75
- Parser confidence: High

Admin can change the diagnostic to **Bepul** before publishing. For a free diagnostic, Tanga price is ignored.

## 4. Important answer-key status

`05.04_DIAGNOSTIKA_PROVISIONAL_KEY.json` contains the fixed provisional technical key used in the upload-ready DOCX.

It is **not an academically verified answer key**. It was generated/frozen for technical testing as requested. Do not market the resulting score as academically authoritative until the key for 1–44 is verified and corrected in Admin.

The key does not rerandomize per student or per attempt.

## 5. Required end-to-end test

### Paid diagnostic

1. Publish the diagnostic as Pullik, 2 Tanga.
2. Open it from a normal student account.
3. Confirm the card shows `2 Tanga` / purchase action.
4. Buy it; confirm exactly 2 Tanga is deducted once.
5. Refresh/reopen; confirm it remains purchased permanently.
6. Confirm direct `/imtihon` access cannot bypass payment before purchase.

### Q45

1. Reach Q45.
2. Confirm only the ESSE topic/rules are shown.
3. Confirm there is **no essay writing textarea or upload**.
4. Confirm optional previous essay result accepts only 0–75.
5. Confirm wording: **“Bu qism ixtiyoriy.”**

### Finish without essay score

1. Leave essay score blank and press `Yakunlash`.
2. Certificate must appear **before** detailed results.
3. Certificate should show Test qismi, `Esse qismi: Kiritilmagan`, Yakuniy ball `—`, Daraja `—`.
4. Close certificate → detailed result page.
5. Profile → Sertifikatlar must contain the certificate.

### Finish with essay score

Example: Test = `61.88`, Esse = `67`.

Expected final result: `64.44 / 75`, level `B+`, percentage indicator `99.14%`.

### Cross-device DB test

1. Complete a diagnostic on device/browser A.
2. Log into the same account on device/browser B.
3. Open Profile → Sertifikatlar.
4. The same certificate must appear from the DB even though local detailed answers are unavailable.

### Free diagnostic

Switch another diagnostic to Bepul and publish it. Confirm it opens without a Tanga purchase while the exam/result routes remain authenticated.

### Calculator

Open `/hisoblagich` from the HomeDrawer.

- Test qismi: 0–75
- Esse qismi: 0–75
- Shows final score, level and percentage
- Saves nothing

## 6. Score rules in this release

- Q1–44 weighted raw maximum = 76.
- Normalized test score = `(raw score / 76) × 75`.
- Essay score = optional previous result, 0–75.
- Final = `(test score + essay score) / 2` only when essay score exists.
- A+: 70–75
- A: 65–69.99
- B+: 60–64.99
- B: 55–59.99
- C+: 50–54.99
- C: 46–49.99
- Below 46: no level.
- Percentage indicator = `min(100, final score / 65 × 100)`.

## 7. Validation performed before packaging

- Parsed all 364 TS/TSX source files with the TypeScript parser: no syntax diagnostics.
- Compiled diagnostic scoring/types with TypeScript using project path aliases.
- Compiled the diagnostic DOCX parser with TypeScript.
- Compiled the diagnostic Admin import/publish conversion with dependency stubs for unavailable external packages.
- Parsed `05.04_DIAGNOSTIKA_UPLOAD_READY.docx` extracted content through the diagnostic parser:
  - taskCount = 45
  - rawMaximumScore = 76
  - maximumScore = 75
  - confidence = high
  - reviewCount = 0
  - invalidCount = 0
- Verified local import paths for all changed/new diagnostic files.
- Verified CSS module class references for the diagnostic runner, certificate and calculator.
- Verified the score thresholds and example calculation programmatically.

Full `next build` was not run in this container because project dependencies were not available locally; the Vercel deployment is the final framework/build verification.
