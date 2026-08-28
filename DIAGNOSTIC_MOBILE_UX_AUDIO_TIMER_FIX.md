# TA’LIMOT Diagnostic — mobile UX, audio ZIP and timer fix

This patch is based on `talimotv10.3_diagnostic_v1_final`.

## Fixed student UI
- Removes duplicated inline A/B/C/D options from question/context text while preserving the real option cards.
- Q3 renders definition pairs as a visual left → right diagram.
- Q4 renders the three-word synonym relationship as a compact triangle diagram.
- Q36 renders `Nom-nishon, iz ← ? → Ijod mahsuli` as a diagram and uses a compact answer input.
- Q33–35 use a dedicated matching-paper layout with an A–F bank and per-question answer buttons.
- Written questions separate the source sentence/text from answer-writing instructions.
- Q36–44 use compact single-line answer controls instead of oversized textareas where appropriate.

## Timer
- Uses an absolute deadline rather than relying on one-second JavaScript decrements.
- Resynchronizes after Telegram/iOS visibility/background changes.
- The finish-confirmation UI no longer effectively pauses elapsed time.
- Saved progress stores the current remaining time calculated from the deadline.

## Diagnostic audio ZIP
- Diagnostic drafts now support one ZIP for Q1–Q44.
- `q01` maps to Q1 through `q44` maps to Q44; Q45 essay is excluded.
- Works across direct MCQ, passage questions, Q33–35 matching items, Q36–39 short answers and Q40–44 multipart questions.
- Existing uploader validates the complete set before upload.

## Metadata correction
- Diagnostic final maximum score metadata is 75, matching the TA’LIMOT normalized test score model.

## Database
No new SQL migration is required for this patch.
