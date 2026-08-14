TA'LIMOT v10.8 — LONG MCQ STUDENT UI

MAQSAD
Fe'l, Morfemika va shunga o'xshash uzun MCQ savollarini mobile UI'da o'qishga qulay ko'rsatish.

NIMA O'ZGARDI
- Savol ko'rsatmasi alohida sarlavha.
- Asosiy gap/parcha alohida MATN/PARCHA card.
- (1), (2), (3), ... hukmlar alohida numbered cards.
- "HUKMLAR" va "JAVOBNI TANLANG" visual hierarchy.
- A/B/C/D variantlari uzun savollarda ixchamroq.
- Short MCQ (masalan IMLO) eski layoutda qoladi.
- Parser, test data, correct answers, scoring va audio logic o'zgarmaydi.

QANDAY QO'LLANADI
1) talimotv10-8-long-mcq-ui-patch papkasini PROJECT ROOT ichiga extract qiling.
2) Shu patch papkasida PowerShell oching.
3) Run:
   powershell -ExecutionPolicy Bypass -File .\apply-v10-8.ps1
4) Project rootda:
   npm run build
5) Build green bo'lsa git add/commit/push qiling.

PATCHNI QO'LLAGANDAN KEYIN
Patch papkasini o'chirish mumkin. Actual code src/ ichiga copy qilingan bo'ladi.
