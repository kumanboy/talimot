# Aralash Q33-Q44 single-audio update — v10.7.2

## Admin
- Matching 33, 34, 35: one audio per source question (`q33`, `q34`, `q35`).
- Q39: one question-level audio (`q39`).
- Multipart Q40-Q44: one question-level audio only (`q40` ... `q44`).
- Multipart audio uploader is shown once for the whole question, not inside every a/b part.
- ZIP importer uses one audio file per source question. It no longer requires `q40-a`, `q40-b`, etc.

## Student result view
- Multipart a/b parts show the user's written answer and the platform correct answer.
- One audio explanation appears below all parts, following the same wrong-answer behavior as standard tests.
- Old published multipart data with only part-level audio still has a read-only fallback to the first legacy audio.

## Q44 b
- Q44 b is `manual-review`.
- It has zero automatic score weight and does not make Q44 automatically wrong.
- User may enter free text; the UI shows `Qo‘lda tekshiriladi` instead of a platform correct answer.
- Q44 a remains automatically graded.

No SQL changes are required.
