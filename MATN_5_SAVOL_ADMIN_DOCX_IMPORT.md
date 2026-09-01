# Matn + 5 savol Admin DOCX import

Added a dedicated direct-import workflow for Milliy sertifikat categories:
- G‘azal
- Ilmiy matn
- Badiiy matn

When format is `passage-five`, Admin now shows a compact DOCX importer with a visible `DOCX ni draftga import qilish` button immediately after validation.

Parser compatibility improvements:
- G‘azal accepts the existing section-based schema and the current 28–32 upload-ready DOCX layout.
- G‘azal fallback extracts bayts, optional lug‘at, five questions and inline `JAVOB:` keys.
- Badiiy/Ilmiy matn accepts `MATN` or `MATN:` and can infer the five-question section when a `SAVOLLAR` heading is absent.
- Existing national-certificate `passage-five` schema, student runners, scoring and publish validation are reused.

Validated with the current G‘azal 3, G‘azal 9, G‘azal moni’ and Badiiy matn/Anor admin-upload documents.

No SQL changes are required.
