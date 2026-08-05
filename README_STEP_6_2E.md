# TA’LIMOT — Step 6.2E DOCX Questions → Draft Editor

Replace:

```text
src/features/admin/tests/draft/components/admin-docx-import-preview.tsx
src/features/admin/tests/draft/components/admin-docx-import-preview.module.css
src/features/admin/tests/draft/components/admin-multiple-choice-draft-editor.tsx
src/features/admin/tests/draft/components/admin-multiple-choice-draft-editor.module.css
```

Features:

- Automatically selects every non-invalid parsed question.
- Allows per-question selection.
- Invalid/red questions cannot be selected.
- Allows human review of A/B/C/D correct answer.
- Imports selected questions into the existing draft editor.
- Existing manual questions are preserved.
- Imported questions are appended.
- `sourceOrder` stores the original DOCX question number.
- Imported questions are not saved automatically.
- Admin must press `Draftni saqlash` to persist them to Supabase.

Verify:

```powershell
Remove-Item -Recurse -Force .next
npm run typecheck
npm test
npm run build
npm run dev
```

Test flow:

1. Upload `IMLO.1 20.docx`.
2. Confirm 20 yellow questions.
3. Choose correct answers for a few questions.
4. Click `Draftga import qilish`.
5. Confirm imported questions appear in the editor.
6. Click `Draftni saqlash`.
7. Refresh and confirm persistence.
