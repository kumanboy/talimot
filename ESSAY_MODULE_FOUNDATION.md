# TA'LIMOT Essay Module Foundation

## Production rules locked in this version

- AI review: text only, 3 Tanga, instant flow later connected to OpenAI.
- Teacher review: text OR 1-5 images, 6 Tanga.
- Teacher review supports written feedback and optional audio feedback.
- Teacher review is asynchronous: pending -> in_review -> completed.
- Diagnostic certificate must wait for essay review completion when teacher review is selected.
- AI diagnostic can complete the final result immediately after successful AI grading.
- Purchased books/courses are unrelated to Tanga essay accounting.

## Database

`ESSAY_FOUNDATION.sql` creates:

- `essay_submissions`
- `essay_submission_files`
- `essay_reviews`

Student essay images must be stored in a private storage bucket and served to teachers with short-lived signed URLs. Do not make student essay images public.

## Admin / teacher queue

`/admin/essays` is now a real DB-backed queue shell. The next integration adds:

1. real student submission API + atomic Tanga debit;
2. private signed image uploads;
3. teacher claim/lock action;
4. rubric grading form;
5. written + audio feedback upload;
6. completion notification and diagnostic certificate finalization;
7. AI grading route using the approved rubric prompt.
