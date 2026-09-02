# Aralash test — Audio ZIP Admin upload

Added bulk audio ZIP upload support to Milliy sertifikat → Aralash tests.

## 41-savol tipi / multipart naming

For a 20-question test with `a` and `b` parts, use 40 files:

- `q01-a.mp3`
- `q01-b.mp3`
- `q02-a.mp3`
- `q02-b.mp3`
- ...
- `q20-a.mp3`
- `q20-b.mp3`

M4A and WAV are also supported.

The ZIP importer maps each file to the matching multipart part explanation audio. Existing single-audio formats continue to use `q01.mp3`, `q02.mp3`, etc.

Matching questions use `qNN-01`, `qNN-02`, ... for their items. Short-answer and standard questions inside a mixed draft use `qNN`.

## Workflow

1. Import/create the Aralash questions.
2. Save the draft.
3. Select the Audio ZIP.
4. Verify the mapping preview.
5. Upload all audio.
6. Save the draft again.

No SQL changes are required.
