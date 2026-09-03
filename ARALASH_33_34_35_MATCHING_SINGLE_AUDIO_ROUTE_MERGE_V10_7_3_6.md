# TA’LIMOT v10.7.3.6 — 33–34–35 matching single-audio + Sintaksis route preservation

This package is based on `v10.7.3.5_SYNTAX_MATCHING_ROUTE_PRESERVE_FIX` and re-applies the matching single-audio behavior without removing the Sintaksis route-preservation fix.

## Behavior
- One 33–34–35 matching block = one explanation audio.
- A 20-block practice test expects exactly 20 files: `q01.mp3` ... `q20.mp3`.
- It no longer creates 60 audio targets from the repeated child labels 33/34/35.
- Bulk upload stores the audio on the matching parent question.
- Manual Admin audio upload for matching is also parent/group-level.
- Publish keeps the group explanation audio.
- Student result review renders the shared audio once below the matching block when at least one item is incorrect.
- Legacy item-level matching audio remains readable as fallback when no group audio exists.
- Grammatika → Sintaksis route-preservation logic from v10.7.3.5 remains intact.

No SQL is required.
