# v10.7.3.5 — 33–34–35 matching single audio

- Mixed 33–34–35 matching practice now expects **one audio per matching block**, not one audio per 33/34/35 item.
- A 20-block matching test therefore shows **20 AUDIO** and expects `q01.mp3` … `q20.mp3`.
- The uploaded audio is stored on the matching group (`question.id`).
- Student result review shows the shared audio **once below the full matching block** when the block contains an incorrect item.
- Legacy item-level matching audio remains supported when no group-level audio exists.
- Diagnostic matching behavior is unchanged.
- No SQL migration required.
