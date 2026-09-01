# Badiiy asarlar — 20-question standard import fix

## Problem
The Admin category `Badiiy asarlar` was hard-coded to `standard-five`. Even when the UI showed `Standart`, the server forced the draft back to the 5-question literary format and the DOCX preview used the literary-works parser. A valid 20-question Adabiyot DOCX therefore could not show the normal import action.

## Fix
- New `Badiiy asarlar` drafts now use `standard`.
- The create action preserves `standard` instead of forcing `standard-five`.
- A standard Badiiy-asarlar draft uses the normal Standard MCQ DOCX parser.
- Standard publishing accepts exactly 20 MCQs.
- National-certificate Badiiy-asarlar pages support 20-question standard tests.
- Existing published 5-question `standard-five` literary tests remain readable and listed for backwards compatibility.
- No database migration is required.

## Admin flow
Create test → Guruh: Milliy sertifikat → Kategoriya: Badiiy asarlar → Format: Standart → upload DOCX → analyze → select/import 20 questions → save/publish.
