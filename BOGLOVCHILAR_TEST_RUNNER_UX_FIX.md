# Bog'lovchilar test runner UX fix

Updated the standard test runner so slash-based Bog'lovchilar questions are presented like the structured Morfemika UX.

## What changed
- The instruction/question is shown separately.
- The example sentence is shown in a dedicated `GAP` source card.
- Answer options remain unchanged.
- Works for both `/` and `//` question types.
- The change is constrained to questions containing `/`, so ordinary standard MCQ questions keep their existing rendering.
- Existing Morfemika structured-question rendering remains intact.

No SQL changes are required.
