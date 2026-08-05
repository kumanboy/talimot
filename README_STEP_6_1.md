# TA’LIMOT — Step 6.1 DOCX Upload Preview

Replace:

- `package.json`
- `src/features/admin/tests/draft/components/admin-multiple-choice-draft-editor.tsx`

Add:

- `src/features/admin/tests/draft/model/admin-docx-import-preview-action-state.ts`
- `src/features/admin/tests/draft/actions/preview-admin-docx-import-action.ts`
- `src/features/admin/tests/draft/components/admin-docx-import-preview.tsx`
- `src/features/admin/tests/draft/components/admin-docx-import-preview.module.css`

Install:

```powershell
npm install
```

The upload is limited to `.docx` and 10 MB. Mammoth runs only on the server.
Generated HTML is never rendered. The UI receives sanitized text blocks only.

Verify:

```powershell
npm run typecheck
npm test
npm run build
```

Then upload a real DOCX in the existing draft editor. This step only previews;
it does not change or save draft questions.
