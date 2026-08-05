# TA’LIMOT — Step 5.1 Create Draft Page

## Add

```text
src/app/admin/tests/new/page.tsx
src/app/admin/tests/[testId]/edit/page.tsx

src/features/admin/tests/draft/actions/
└── create-admin-test-draft-action.ts

src/features/admin/tests/draft/components/
├── admin-create-test-draft-page.tsx
├── admin-create-test-draft-page.module.css
├── admin-draft-editor-placeholder.tsx
└── admin-draft-editor-placeholder.module.css
```

## Route

```text
/admin/tests/new
```

## Flow

1. Admin session is checked.
2. Metadata form is validated on the server.
3. An empty draft is created through `AdminTestDraftService`.
4. The draft is written to Supabase PostgreSQL.
5. Duplicate group/topicSlug/slug routes are rejected.
6. The browser redirects to:

```text
/admin/tests/[draftId]/edit
```

The edit page is intentionally a placeholder for Step 5.2.

## Verify

```powershell
npm run typecheck
npm test
npm run build
```

Then run the app:

```powershell
npm run dev
```

Open:

```text
http://localhost:3000/admin/tests/new
```
