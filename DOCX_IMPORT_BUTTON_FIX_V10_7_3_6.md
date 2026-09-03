# v10.7.3.6 — DOCX import button visibility fix

- Standard MCQ DOCX import action is now shown immediately below the DOCX preview statistics after a successful parse.
- The primary action is labeled `DOCX ni draftga import qilish`, so Admin does not need to scroll through raw/structural preview to find it.
- Existing select-all / clear-selection / answer-review behavior is preserved.
- Sintaksis DOCX routing keeps `auto` detection so both standard tests and 33–34–35 matching DOCX files can be imported from the same Sintaksis route.
- Resolved the accidental merge-conflict markers in `admin-multiple-choice-draft-editor.tsx` while preserving the v10.7.3.5 single-audio matching behavior.
- Raw/structural DOCX inspection remains secondary and collapsed behind its `<details>` control.
- No SQL migration required.
