# TA’LIMOT Admin — Step 3

## Add

- `src/features/admin/tests/model/admin-test-details.ts`
- `src/features/admin/tests/components/admin-test-details-page.tsx`
- `src/features/admin/tests/components/admin-test-details-page.module.css`
- `src/app/admin/tests/[testId]/page.tsx`

## Replace

- `src/features/admin/tests/model/admin-test-catalog.ts`
- `src/features/admin/tests/components/admin-tests-page.tsx`
- `src/features/admin/tests/components/admin-tests-page.module.css`

## Result

- Every catalog row has `Batafsil`
- `/admin/tests/[testId]`
- Test metadata
- Registry/dataset status
- Questions and options for active datasets
- Correct answers visible only inside admin
- Audio availability
- Planned tests show a no-dataset message
- Still read-only

## Verify

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Check:

- `/admin/tests`
- active standard grammar test details
- active national test details
- planned test details
- unknown ID returns 404
