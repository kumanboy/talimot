# TA’LIMOT Admin — Step 1

## Replace

- `src/app/admin/page.tsx`

## Add

- `src/features/admin/components/admin-shell.tsx`
- `src/features/admin/components/admin-shell.module.css`

## Result

- Shared admin sidebar
- Active route support
- Session status
- Logout
- Dashboard and Testlar working links
- Future sections disabled
- No test catalog implementation yet

## Verify

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Open:

- `/admin`
- click `Testlar`

`/admin/tests` may still show 404 until Step 2. This is expected.
