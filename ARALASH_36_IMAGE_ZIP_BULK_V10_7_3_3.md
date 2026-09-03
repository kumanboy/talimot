# TA'LIMOT v10.7.3.3 — Aralash question-image ZIP bulk upload

- Admin `Aralash` draft editor now supports one question image per source question via one ZIP.
- Naming: `q01.png` ... `q20.png` (also `q1.png` accepted). JPEG/JPG/WebP are accepted too.
- Images are matched to the source question number, uploaded directly to Supabase Storage using signed upload URLs, and attached to `question.image`.
- Existing image replacements are queued for safe storage removal after the draft is saved.
- This is separate from audio ZIP upload; no audio behavior was changed.
- Intended for 36-savol tipi diagram questions, but works for top-level Aralash questions generally.
- No SQL migration is required.
