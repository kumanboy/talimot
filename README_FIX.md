# TA’LIMOT — User Flow, Certificate and Root Script Fix

## Replace

```text
src/app/layout.tsx
src/features/tests/components/test-runner.tsx
src/features/national-certificate/components/diagnostic-test-runner.tsx
```

## Append

Append the contents of:

```text
APPEND_TO_diagnostic-test-runner.module.css
```

to:

```text
src/features/national-certificate/components/diagnostic-test-runner.module.css
```

## Fixes

- Standard test `Saqlash va chiqish` now routes to `/tests`.
- Diagnostic `Saqlash va chiqish` now routes to `/tests`.
- `beforeInteractive` theme script moved into root `<head>`.
- Diagnostic certificate preview receives required `testTitle` and `result`.
- Completed diagnostic with a certificate shows:
  - `Sertifikatni ko‘rish`
  - `Profilga saqlash`
- Existing automatic certificate opening is preserved.

## VS Code “file is newer” message

Close the stale editor tab before replacing the file, or choose **Compare**.
Do not choose **Overwrite** on an older unsaved tab after copying this patch.

## Verify

```powershell
Remove-Item -Recurse -Force .next
npm run typecheck
npm test
npm run build
npm run dev
```

Test:

1. Start a grammar test, choose `Saqlash va chiqish` → `/tests`.
2. Start diagnostic, choose `Saqlash va chiqish` → `/tests`.
3. Complete diagnostic with a filled profile.
4. Certificate should open automatically.
5. Result page should show both certificate/profile buttons.
