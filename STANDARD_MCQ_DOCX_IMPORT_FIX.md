# Standard MCQ DOCX import fix

Fixed the Punktuatsiya/Admin import failure shown in the preview.

## Root cause
Rows in a trailing answer-key table such as `1. B`, `11. A`, etc. matched the
standard question regex and were parsed as duplicate questions. The real
question/options were then effectively replaced by answer-key rows in the UI.

## Fix
- Pure compact answer-key rows are consumed before numbered-question parsing.
- `TO‘G‘RI JAVOBLAR KALITI` is recognized as a structural heading.
- Inline `JAVOB: X` support remains unchanged.
- Known harmless Mammoth Word-style warnings are hidden; unexpected warnings remain visible.
- No scoring, test-runner, database, or payment logic changed.

No SQL required.
