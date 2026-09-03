# TA’LIMOT v10.7.3 — Aralash single-audio correction

- Aralash MULTIPART savol: 1 savol = 1 audio.
- ZIP naming: q01.mp3, q02.mp3, ...; q1.mp3/q01.mp3 are both accepted. q01-a/q01-b are rejected as unmatched.
- 41-savol tipi 20 multipart draft => 20 AUDIO, not 40 AUDIO.
- 33, 34, 35, 39, 40, 41, 42, 43, 44 source question numbering uses one audio per numbered question.
- Q44 b-part remains manual-review only; Q44 a-part remains automatically checked.
- No SQL migration is required.
