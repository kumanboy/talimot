# Ona Tili Mock Platform - Product Decisions

Status: approved and frozen product decisions. These values override conflicting examples in the PDF and Figma while preserving the PDF's architecture, security, versioning, and data-integrity rules.

## Exam format and final score

| Decision | Frozen value |
|---|---:|
| Total displayed items | 45 |
| Questions 1-44 | Objective/open-answer section |
| Question 45 | Essay |
| Exam duration | 180 minutes |
| Objective score | 0-75 |
| Essay score | 0-75 |
| Raw combined total | 0-150 |
| Certificate score | `(objectiveScore + essayScore) / 2` |
| Maximum certificate score | 75 |

Scoring and display rules:

- Keep objective, essay, raw combined, and certificate calculations at full precision internally.
- Display the objective and essay section scores with 2 decimals.
- Calculate the raw combined total as `objectiveScore + essayScore`.
- Calculate the certificate score as `(objectiveScore + essayScore) / 2`.
- Round the certificate score to 1 decimal before assigning the certificate level.
- A result is preliminary while question 45 or any open answer requiring review is pending. A preliminary objective score must not be presented as a final certificate score.
- All prior illustrative examples that treat 150 as the certificate-score maximum or conflict with this contract are superseded.

### Certificate levels

The level is assigned from the certificate score after rounding it to 1 decimal:

| Rounded certificate score | Level |
|---:|---|
| 70.0-75.0 | A+ |
| 65.0-69.9 | A |
| 60.0-64.9 | B+ |
| 55.0-59.9 | B |
| 50.0-54.9 | C+ |
| 45.0-49.9 | C |
| Below 45.0 | Certificate level not achieved |

## Questions 1-44 objective scoring

The assessment PDF's raw weights are frozen:

| Questions | Raw weight |
|---|---:|
| Q1-Q3 | 1.1 each |
| Q4 | 1.7 |
| Q5-Q6 | 1.1 each |
| Q7 | 1.7 |
| Q8 | 2.5 |
| Q9-Q11 | 1.7 each |
| Q12 | 2.5 |
| Q13-Q22 | 1.7 each |
| Q23-Q27 | 1.1 each |
| Q28-Q32 | 2.5 each |
| Q33-Q36 | 1.7 each |
| Q37 | 2.5 |
| Q38-Q39 | 1.7 each |
| Q40a | 1.2 |
| Q40b | 1.3 |
| Q41a-Q44a | 0.8 each |
| Q41b-Q44b | 0.9 each |

The raw objective maximum is exactly 76. The earned raw objective score is normalized to 75:

`objectiveScore = (earnedRawObjective / 76) * 75`

Rules:

- Keep the normalized objective score at full precision internally and display it with 2 decimals.
- Score `a` and `b` independently for Q40-Q44.
- Each Q40-Q44 sub-answer receives either its complete raw weight or zero. Do not create additional partial points within one sub-answer.
- The immutable scoring-policy version stores the complete raw-weight table, raw maximum `76`, normalization contract, answer policy, and rounding/display rules.

## Essay rubric and conversion

Authoritative sources:

- `Esse_tekshirish_yoriqnoma.pdf`
- the supplied `RUBRIC_PROMPT`

The rubric is frozen as 12 criteria:

1. Publitsistik uslub.
2. Qarashlar va shaxsiy fikr yoritilishi.
3. Dalillash.
4. Kirish-asosiy qism-xulosa.
5. Matn qurilishi va xatboshilar.
6. Izchillik va takror.
7. Imlo.
8. Punktuatsiya.
9. Qo‘shimcha qo‘llash.
10. So‘z qo‘llash bilan bog‘liq uslubiy xatolik.
11. Leksik xilma-xillik.
12. Nutq sofligi.

Rubric rules:

- Every criterion permits only `0`, `0.5`, `1`, `1.5`, or `2`.
- Raw essay maximum is 24.
- Evaluation applies the official UZBMB criteria plus Sardor Toshmuhammadov's additional structure rules.
- The rubric criteria, structure rules, stop cases, and conversion matrix are versioned together and immutable once used.
- Conversion from raw `/24` to essay `/75` uses only the complete fixed lookup matrix below. Never calculate the conversion with a formula or interpolation.

| Raw | Essay | Raw | Essay | Raw | Essay |
|---:|---:|---:|---:|---:|---:|
| 24 | 75 | 16 | 59 | 8 | 43 |
| 23.5 | 74 | 15.5 | 58 | 7.5 | 42 |
| 23 | 73 | 15 | 57 | 7 | 41 |
| 22.5 | 72 | 14.5 | 56 | 6.5 | 40 |
| 22 | 71 | 14 | 55 | 6 | 39 |
| 21.5 | 70 | 13.5 | 54 | 5.5 | 38 |
| 21 | 69 | 13 | 53 | 5 | 37 |
| 20.5 | 68 | 12.5 | 52 | 4.5 | 36 |
| 20 | 67 | 12 | 51 | 4 | 35 |
| 19.5 | 66 | 11.5 | 50 | 3.5 | 34 |
| 19 | 65 | 11 | 49 | 3 | 33 |
| 18.5 | 64 | 10.5 | 48 | 2.5 | 32 |
| 18 | 63 | 10 | 47 | 2 | 31 |
| 17.5 | 62 | 9.5 | 46 | 1.5 | 30 |
| 17 | 61 | 9 | 45 | 1 | 29 |
| 16.5 | 60 | 8.5 | 44 | 0.5 | 28 |
| 0 | 0 |  |  |  |  |

Authority rules:

- An AI-only result is the final platform result when teacher review is not purchased. When Teacher + AI review is purchased, the completed teacher result replaces the student-visible AI result for that exact essay submission version.
- When a real teacher review is purchased, the teacher-reviewed result replaces the AI result as the authoritative student-visible essay result.
- The replaced AI evaluation remains stored for audit and history.
- Historical evaluations retain their exact rubric, structure-rule, matrix, model/prompt, and evaluator versions.

## Scoring-policy versioning and corrections

Every published test version references an immutable scoring-policy version. At submission, the attempt and result retain the exact scoring-policy version used.

Published tests are reviewed and immutable:

- Do not implement post-submission question invalidation.
- A content correction creates a new question revision and a new test version.
- Historical attempts and results remain unchanged.
- Historical results remain reproducible from frozen question revisions, answer revisions, raw weights, rubric/matrix versions, and the submission scoring-policy version.
- A correction never silently recalculates a historical result.

Minimum persisted references:

- `TestVersion.scoringPolicyVersion`
- `Attempt.submissionScoringPolicyVersion` or equivalent immutable snapshot
- `AttemptResult.scoringPolicyVersion`
- `AttemptResult.resultVersion`
- the frozen question-revision and rubric/matrix version references used by the attempt

## Topic practice

Topic practice is separate from the full mock.

Launch modules:

1. Fonetika
2. Morfemika
3. Uslubiyat
4. Morfologiya
5. Sintaksis
6. G‘azal
7. Ilmiy matn
8. Badiiy matn

Routes:

- `/mavzular`
- `/mavzular/:slug`
- `/mashqlar/:quizId`

Rules:

- Standard Fonetika, Morfemika, Uslubiyat, Morfologiya, and Sintaksis quizzes contain 20 questions and last 30 minutes.
- G‘azal uses one complete g‘azal plus 5 questions and lasts 20 minutes.
- Ilmiy matn and Badiiy matn use one complete text plus 5 questions and last 20 minutes.
- Questions have equal value; the result is out of 100%.
- A free quiz allows at most 2 attempts per immutable quiz version.
- A paid quiz costs 1 Tanga and allows at most 3 attempts per immutable quiz version.
- Progress uses the best result: below 60% `Needs improvement`; 60-79% `Good`; 80-100% `Mastered`.
- Every quiz provides progress, durable autosave, completion, score, explanations, and retry.
- Administrators may add more topic modules later.
- Topic-practice attempts, results, and analytics remain distinct from full-mock history and scoring.

## Standalone essay checking

`/esse-tekshirish` is outside full-mock attempts and supports topic selection, typed submission, handwritten upload, word count, criterion scores, mistakes, recommendations, history, and teacher-review status.

Rules:

- `AI check`: 2 Tanga; the first AI check per account is free.
- `Teacher + AI check`: 6 Tanga.
- AI result due within 15 minutes and clearly labelled as AI assessment.
- Teacher result retains the frozen overall 24-hour delivery target. After the teacher accepts an essay, a separate 15-minute review SLA begins.
- An AI-only result is the final platform result when teacher review is not purchased. When Teacher + AI review is purchased, the completed teacher result replaces the student-visible AI result for that exact essay submission version.
- A purchased real teacher result replaces the AI result.
- Sardor Toshmuhammadov is the only launch teacher.
- Maximum teacher capacity is 15 reviews per day, automatically assigned FIFO.
- When full, show `Bugungi o‘rinlar tugadi` and the next available date.
- Reserve the teacher slot before atomically and idempotently deducting 6 Tanga.
- Standalone submissions do not create full-mock attempts.

### Essay-topic and submission lifecycle

- Essay-topic lifecycle is `Draft -> Published -> Archived`.
- Only published topics may accept new student submissions. Archiving prevents new submissions without deleting historical attempts.
- The same essay topic may be submitted multiple times.
- Every resubmission is a separate paid attempt.
- The account's first-ever AI check remains free exactly once; resubmission never resets or creates another free check.
- Editing and submitting an earlier essay creates a new attempt; it never overwrites the earlier submitted attempt.
- Every prior result remains immutable.
- Each attempt freezes the exact essay text/upload version, topic version, rubric/matrix version, service selection, price/free-redemption decision, and result lineage.
- A teacher review belongs to the exact submitted essay version purchased for review and must never attach to a later edit or resubmission.

### Teacher-review acceptance, cancellation, and SLA

- Capacity dates and teacher-review timestamps use the `Asia/Tashkent` timezone for policy decisions; canonical timestamps remain stored in UTC.
- The 15-minute review SLA starts at the recorded teacher acceptance time.
- Before teacher acceptance, the student may cancel and receives all 6 Tanga back through a compensating immutable ledger entry.
- After teacher acceptance, cancellation is unavailable.
- If the teacher misses the 15-minute SLA, return all 6 Tanga through a compensating ledger entry and still complete the review.
- Refund after a missed SLA does not cancel, detach, or suppress the eventual teacher-reviewed result.

## Tanga economy and payment boundary

Service costs:

| Service | Cost |
|---|---:|
| Paid topic quiz | 1 Tanga |
| Paid mock test | 2 Tanga |
| AI essay check | 2 Tanga |
| Teacher + AI essay check | 6 Tanga |

Packages:

| Package | Price |
|---|---:|
| 7 Tanga | 21,000 so‘m |
| 15 Tanga | 40,000 so‘m |
| 30 Tanga | 88,000 so‘m |

Rules:

- Manual card-transfer Tanga top-up is available only on the standalone website.
- Do not expose a card number, transfer instructions, receipt upload, or card-transfer purchase action inside the Telegram Mini App.
- A successfully credited Tanga balance may be visible and usable by the same account on both surfaces.
- Manual payment statuses are `Pending`, `Approved`, `Rejected`, `Cancelled`, and `Reversed`.
- A new request requires a receipt image, payer's full name, and transfer date and time.
- Add Tanga only after administrator approval.
- Rejection requires a recorded reason.
- A user may cancel only a `Pending` request.
- A rejected payment may be resubmitted only as a new request with its own identity and history.
- Reversal requires an authorized administrator and a recorded reason.
- Tanga credits and deductions are immutable ledger entries. Never directly edit a numeric balance.
- Approval and crediting are atomic and idempotent; rejection never credits Tanga.
- Never delete ledger or payment-state history. A reversal creates a compensating ledger entry linked to the original credit.
- If a reversal produces a negative Tanga balance, block new purchases until the balance is restored to a non-negative value.
- The first free AI check is a unique per-account redemption.

## Brand identity

Frozen brand decisions:

- Official product name: `TA’LIMOT`.
- Tagline: `Milliy sertifikatlar platformasi`.
- Approved logo direction: `Concept A — Kitob va koshin`.
- Approved concept node: `204:7`.
- The identity is an open-book `T` with a negative-space koshin diamond.
- The identity must not include a tick or checkmark.
- The temporary `OT` mark is deprecated and must not be used for new implementation.

Approved brand colors:

| Color | Value |
|---|---|
| Primary blue | `#5D9CEC` |
| Heritage turquoise | `#168C8C` |
| Dark | `#1E2229` |
| White | `#FFFFFF` |

Approved Figma logo component sets:

| Asset | Component-set node |
|---|---:|
| Horizontal with tagline | `210:39` |
| Horizontal without tagline | `210:64` |
| Stacked | `210:89` |
| Default mark | `210:106` |
| Small optical mark | `210:123` |
| App icon | `210:140` |

## Onboarding, diagnostic, and roadmap

Frozen routes:

- `/onboarding`
- `/diagnostika`
- `/yol-xaritasi`

Welcome screen:

> Xush kelibsiz!
>
> Biz bilan A+ darajaga erishing!
> Milliy sertifikat sari ishonchli yo‘lingizni birgalikda boshlashga tayyormisiz?

Button: `Boshlash`. Use a short elegant entrance animation with reduced-motion support.

### Approved onboarding welcome design

- Approved Entry frame: `195:646`.
- Approved Ready frame: `195:631`.
- Use the `Full color on light` variant from component `210:40` in the `Brand/Logo — Horizontal without tagline` component set.
- The responsive content wrapper fills its container, is capped at `342px`, and retains at least `24px` horizontal margins.
- Approved viewport checks are `360 x 800`, `390 x 844`, and `430 x 932`.
- Supporting text uses `#3973BC`; primary text remains `#1E2229` and secondary text remains `#5E6872`.
- The primary button is `56px` high and retains `24-28px` bottom spacing.
- Entry waits `350ms`, then transitions to Ready with Smart Animate, Ease Out, over `500ms`.
- Reduced-motion mode displays the Ready state immediately.
- This welcome screen is approved for frontend implementation.

Questions appear one at a time with these exact option sets:

1. **Siz qaysi toifaga kirasiz?**
   - Maktab o‘quvchisiman
   - Abituriyent yoki talabaman
   - Ona tili o‘qituvchisiman
2. **Milliy sertifikat sizga qaysi yo‘nalish uchun kerak?**
   - Asosiy fan sifatida
   - Majburiy fan sifatida
3. **Milliy sertifikat imtihonini avval topshirganmisiz?**
   - Ha, topshirganman
   - Yo‘q, birinchi marta topshiraman
4. **Oxirgi natijangiz qaysi daraja edi?** Shown only after `Ha, topshirganman`.
   - A+
   - A
   - B+
   - B
   - C+
   - C
   - Sertifikat ololmaganman
   - Natijamni eslay olmayman
5. **Qaysi darajaga erishishni maqsad qilgansiz?**
   - A+
   - A
   - B+
   - B
   - C+
   - C
6. **Milliy sertifikat imtihonigacha qancha vaqtingiz bor?**
   - 1 oydan kam
   - 1-2 oy
   - 3-4 oy
   - 5 oy yoki undan ko‘p
   - Imtihon sanasini hali tanlamaganman
7. **Qaysi mavzularda ko‘proq qiynalasiz?** Select 1-3.
   - Fonetika
   - Morfemika
   - Uslubiyat
   - Morfologiya
   - Sintaksis
   - G‘azal
   - Ilmiy matn
   - Badiiy matn
   - Esse yozish
   - Hozircha aniq bilmayman
8. **Tayyorgarlik uchun kuniga qancha vaqt ajrata olasiz?**
   - 30 daqiqagacha
   - 30-60 daqiqa
   - 1-2 soat
   - 2 soatdan ko‘p
   - Har kuni vaqt ajrata olmayman
9. **Haftasiga necha kun tayyorlana olasiz?**
   - 1-2 kun
   - 3-4 kun
   - 5-6 kun
   - Har kuni
10. **Esse yozish bo‘yicha o‘zingizni qanday baholaysiz?**
    - Hali esse yozishni boshlamaganman
    - Tuzilmani bilaman, lekin yozishda qiynalaman
    - Esse yoza olaman, ammo xatolarim ko‘p
    - Yaxshi yozaman, ballimni oshirmoqchiman
    - Darajamni aniq bilmayman
11. **Ona tili bo‘yicha hozirgi tayyorgarligingiz qanday?** First-time users only; select exactly one.
    - Hammasini noldan boshlamoqchiman
    - Asosiy qoidalarni biroz bilaman
    - Mavzularni o‘rganganman, lekin testlarda qiynalaman
    - Bilimim yaxshi, menga tizimli reja kerak

Diagnostic blueprint:

| Topic | Questions |
|---|---:|
| Fonetika | 1 |
| Morfemika | 1 |
| Uslubiyat | 1 |
| Morfologiya | 2 |
| Sintaksis | 2 |
| G‘azal | 2 |
| Ilmiy matn | 3 |
| Badiiy matn | 3 |
| **Total** | **15** |

Branching:

- Previous exam takers choosing the roadmap path begin at `/diagnostika`.
- Previous exam takers may instead open the mock catalogue at `/tests`.
- First-time users receive a response-based preliminary roadmap at `/yol-xaritasi`.
- Diagnostic is optional for first-time users.
- A completed diagnostic produces an accurate roadmap at `/yol-xaritasi`.
- Diagnostic topics are administrator-editable; a started diagnostic retains its immutable published version.

### Diagnostic-to-roadmap algorithm

- All 15 diagnostic questions have equal value.
- Readiness levels use the total diagnostic percentage:
  - `0-39%`: `Boshlang‘ich`;
  - `40-59%`: `Rivojlanayotgan`;
  - `60-79%`: `Yaxshi`;
  - `80-100%`: `Kuchli`.
- These labels are preparation-readiness levels and are never certificate grades.
- Incorrect diagnostic topics and the user's self-selected weak topics receive roadmap priority.
- The roadmap starts with the three weakest topics.
- After a student completes a standard 20-question topic quiz, that quiz result replaces the diagnostic estimate for that topic in subsequent roadmap versions.
- Earlier diagnostic results remain immutable; replacement changes the active roadmap estimate, not historical diagnostic data.

## Remaining genuine blockers

No unresolved product-decision blockers remain.
