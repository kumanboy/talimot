# TA’LIMOT Admin — Step 4.1

## Add

- `src/features/admin/tests/draft/model/admin-question-types.ts`
- `src/features/admin/tests/draft/model/admin-test-draft-types.ts`
- `src/features/admin/tests/draft/model/admin-test-draft-factory.ts`
- `src/features/admin/tests/draft/model/admin-test-draft-validation.ts`
- `src/features/admin/tests/draft/model/index.ts`

## Purpose

This step creates the shared draft domain model for:

- manual test creation
- DOCX import
- PDF import
- question editor
- audio/image assets
- validation
- future publishing

## Supported question types

- multiple-choice
- short-answer
- matching
- multipart
- passage-group
- essay

## No runtime changes

This step does not change:

- `/admin`
- `/admin/tests`
- student-side tests
- database
- API routes
- localStorage

## Verify

```bash
npm test
npm run lint
npm run typecheck
npm run build
```
