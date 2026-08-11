# TA’LIMOT Essay AI Benchmark v1

Temporary admin-only evaluation layer based on the stable v18.5 project.

- Route: `/admin/ai-benchmark`
- No DB migration required.
- Does not touch student essay flow.
- Does not debit Tanga.
- Does not save benchmark results to DB.
- Each request grades exactly one benchmark essay with one allowed model.
- Supported benchmark models: `gpt-5.6-terra`, `gpt-5.6-sol`.
- Both use the same rubric, prompt, reasoning effort and deterministic 24→75 conversion.
- The UI reports teacher-vs-AI deltas, MAE and directional bias. Positive bias means the AI is scoring higher than the teacher.

Important: benchmark essays 2 and 3 did not include the original exam prompt/situation text, so their topic strings are reconstructed from the essay text. Replace them with the exact original prompt when available for stronger evaluation.
