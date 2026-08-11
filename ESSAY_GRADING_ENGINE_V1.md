# TA’LIMOT Essay Grading Engine v1

This version adds the grading engine only. It is intentionally NOT wired to the student submit button or Tanga debit yet.

## Core decisions

- AI input: text only.
- Default benchmark/production candidate: `gpt-5.6-terra`.
- Quality ceiling for benchmark: `gpt-5.6-sol`.
- OpenAI returns strict JSON Schema output.
- Model never calculates the total `/24` or `/75` score.
- Server validates every criterion score, sums `/24`, then converts through the fixed matrix.
- Word count is server-side and has one implementation.
- `<100` => deterministic 2/24 (31/75), no API call.
- `>350` => rejected before grading, no API call and no Tanga debit.
- Strict calibration: 2 points requires near-complete fulfillment; uncertainty between two adjacent levels resolves downward unless the higher score is clearly supported by the essay.

## Environment variables (later deployment step)

- `OPENAI_API_KEY` (secret)
- `OPENAI_ESSAY_MODEL=gpt-5.6-terra`

Do not put the API key in any `NEXT_PUBLIC_*` variable.

## Files

- `src/features/essay-check/grading/rubric.ts` — 12-criterion rubric.
- `src/features/essay-check/grading/grading-prompt.ts` — strict calibrated examiner prompt.
- `src/features/essay-check/grading/grading-schema.ts` — Structured Outputs JSON schema.
- `src/features/essay-check/grading/openai-essay-grader.ts` — Responses API server-only client.
- `src/features/essay-check/grading/finalize-grade.ts` — validation + deterministic arithmetic.
- `src/features/essay-check/grading/score-matrix.ts` — exact 24→75 lookup matrix.
- `src/features/essay-check/grading/word-count.ts` — single word-count implementation.

## Benchmark anchors supplied by the teacher

- Benchmark 1: 18.5/24 -> 64/75
- Benchmark 2: 14.5/24 -> 56/75
- Benchmark 3: 16/24 -> 59/75

These are calibration/evaluation anchors, not hard caps. A genuinely exceptional essay can score higher; an ordinary essay must not receive high scores merely because it looks polished.
