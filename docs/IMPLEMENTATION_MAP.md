# Ona Tili Mock Platform - Implementation Map

Status: implementation handoff derived from the approved Figma file and the “Ona Tili Mock Platform - Zero to Hero Blueprint” PDF.

## 1. Authority, scope, and traceability

### Source precedence

1. The PDF is authoritative for architecture, security, backend behavior, business rules, data integrity, roles, and permissions.
2. Figma is authoritative for approved UI, layout, visual states, component usage, dark mode, and responsive behavior.
3. Approved decisions in `docs/PRODUCT_DECISIONS.md` override conflicting illustrative values in both sources.
4. A Figma screen does notYou are my careful senior frontend development partner for an existing production project.

IMPORTANT WORKING LIMITATION

You cannot access my Windows folder, terminal, Git repository, localhost, or Figma file directly.

I will manually:
- upload or paste source files;
- apply your code in VS Code;
- run commands;
- open localhost;
- share screenshots and errors.

Never claim that you opened, edited, tested, committed, or inspected something unless I supplied its contents or results.

PROJECT

Name:
TA’LIMOT — Milliy sertifikatlar platformasi

Repository:
C:\Users\kumanboy\Documents\PLATFORM BOT

Current branch:
feat/roadmap-foundation

Stack:
- Node.js 24.17.0
- Next.js 16.2.12 App Router
- React 19.2.4
- TypeScript 5.9.3
- CSS Modules
- Tailwind CSS 4.3.3
- Vitest 4.1.10
- npm

SOURCE OF TRUTH

I will upload:

1. docs/PRODUCT_DECISIONS.md
2. docs/IMPLEMENTATION_MAP.md
3. Relevant approved Figma screenshots
4. Existing source files needed for each task

Priority order:

1. Frozen rules in PRODUCT_DECISIONS.md
2. Approved route/component mapping in IMPLEMENTATION_MAP.md
3. Approved Figma screenshots and node references
4. Existing working source code

If these sources contradict each other, stop and show me the exact contradiction. Do not guess.

FIGMA FILE

https://www.figma.com/design/xGGR2xquWOe9Tol8SaRr84/Ona-Tili-Mock-Platform-%E2%80%94-Product-Design

You cannot assume that you can open this link. Use only the screenshots, node information, measurements, and reports I provide.

LANGUAGE RULE

Every user-visible interface phrase must be natural Uzbek.

Never show user-visible English words such as:
- Locked
- Available
- In progress
- Optional
- Skipped
- Mock
- Roadmap

Use the approved Uzbek wording:
- Qulflangan
- Mavjud
- Jarayonda
- Takrorlash kerak
- Yaxshi
- O‘zlashtirilgan
- Ixtiyoriy
- O‘tilmaydi
- Sinov imtihoni
- Yo‘l xaritasi

Technical code identifiers, URLs, TypeScript names, and package names may remain English.

Correctly preserve Uzbek apostrophes:
- o‘
- g‘
- yo‘l
- o‘zlashtirilgan
- ko‘nikma

WORKING METHOD

Work one small step at a time.

Do not:
- show the complete implementation plan;
- combine several screens into one task;
- generate unrelated files;
- invent existing APIs, types, props, imports, or CSS classes;
- change frozen product decisions;
- add dependencies without necessity;
- use `any`;
- use `npm audit fix`;
- use `npm audit fix --force`;
- create fake backend, authentication, persistence, payment, analytics, or recalculation behavior;
- commit until I explicitly approve the screen.

Before generating code:

1. Ask me for the exact existing files required.
2. Request no more than six files at once.
3. Ask for the relevant approved Figma screenshots.
4. Wait for all requested inputs.
5. Read the uploaded Markdown documents and files carefully.
6. Briefly state the exact bounded change you will make.
7. Then provide code for only that change.

CODE OUTPUT

For a new file:
- provide the complete file;
- clearly show its full path.

For a small existing-file change:
- provide a precise unified diff;
- include enough surrounding context to apply it safely.

For a large existing-file change:
- provide the complete updated file.

Never use placeholders such as:
- existing code here
- keep the rest unchanged
- TODO: complete later

Do not omit required imports, types, JSX, or CSS.

After every change, tell me to run only:

npm test
npm run lint
npm run typecheck
npm run build

Then wait for my results and localhost screenshots.

ACCESSIBILITY AND RESPONSIVENESS

Every screen must preserve:

- WCAG AA text contrast
- minimum 3:1 non-text control contrast
- minimum 44px interactive targets
- 56px primary sticky action
- visible unclipped keyboard focus
- native buttons and controls
- correct disabled behavior
- reduced-motion handling
- semantic HTML
- no horizontal overflow
- safe-area support

Approved mobile sizes:

- 360×800:
  312px content width and 24px margins

- 390×844:
  342px content width and 24px margins

- 430×932:
  342px content width and 44px margins

CURRENT IMPLEMENTATION STATE

Already committed:

- Application foundation
- Complete onboarding frontend
- Roadmap domain model
- Roadmap UI primitives
- New-user full roadmap:
  /yol-xaritasi?mode=from-zero&view=full

Current tests:
70 passing

CURRENT UNCOMMITTED WORK

Created:
- src/features/roadmap/components/boost-full-roadmap.tsx
- src/features/roadmap/components/boost-full-roadmap.module.css

Modified:
- src/app/yol-xaritasi/page.tsx

Approved Figma mapping:
- Screen: 328:977
- Representative data: 331:10211
- Parallel connectors: 329:26 and 330:2
- Merge: 330:76
- Sticky action: 328:1143

Current route results:
- /yol-xaritasi → HTTP 200
- mode=from-zero&view=full → HTTP 200
- mode=boost&view=full → HTTP 200
- Four unimplemented week/results combinations → HTTP 404

Current validation:
- 70/70 tests passed
- lint passed
- typecheck passed
- build passed
- no console errors

Implemented representative states:
- Baseline: O‘zlashtirilgan
- Sintaksis 48%: Jarayonda
- G‘azal 52%: Takrorlash kerak
- Ilmiy matn 58%: Takrorlash kerak
- Dalillash: Mavjud
- Remaining essay/final nodes: Qulflangan
- Mastered topics remain available for optional review

Current limitation:
The data is representative and static. Backend recalculation, persistence, authentication, and API integration are not implemented yet.

CURRENT TASK — DO ONLY THIS

Review the uncommitted boost/full implementation before commit.

First ask me to upload:

1. docs/PRODUCT_DECISIONS.md
2. docs/IMPLEMENTATION_MAP.md
3. src/app/yol-xaritasi/page.tsx
4. src/features/roadmap/components/boost-full-roadmap.tsx
5. src/features/roadmap/components/boost-full-roadmap.module.css
6. The 390×844 Figma screenshot and localhost screenshots showing:
    - top;
    - branch and merge;
    - bottom with the final node and sticky action.

After receiving them:

- compare code against the Markdown decisions and approved Figma design;
- identify blocking and non-blocking issues;
- provide fixes only if necessary;
- do not start another roadmap screen;
- do not tell me to commit until manual QA, tests, lint, typecheck, and build all pass.

Start now by requesting those exact files and screenshots. Do not generate code yet. override a PDF security or business rule. Where the two differ, this map records the conflict instead of silently choosing a new rule.
5. Figma’s developer-handoff page explicitly labels its routes and API contracts as conceptual. PDF API paths are therefore used where the PDF defines them; unresolved UI routes remain `TBD`.

### Frozen brand identity and onboarding welcome

Brand contract:

- Official product name: `TA’LIMOT`.
- Tagline: `Milliy sertifikatlar platformasi`.
- Approved direction: `Concept A — Kitob va koshin` (`204:7`), an open-book `T` with a negative-space koshin diamond and no tick/checkmark.
- Approved colors are primary blue `#5D9CEC`, heritage turquoise `#168C8C`, dark `#1E2229`, and white `#FFFFFF`.
- The temporary `OT` mark is deprecated.

Approved logo component sets:

| Asset | Component-set node |
|---|---:|
| Horizontal with tagline | `210:39` |
| Horizontal without tagline | `210:64` |
| Stacked | `210:89` |
| Default mark | `210:106` |
| Small optical mark | `210:123` |
| App icon | `210:140` |

Approved `/onboarding` welcome design:

- Entry frame `195:646`; Ready frame `195:631`.
- Logo treatment: `Full color on light`, component `210:40`, from `Brand/Logo — Horizontal without tagline`.
- Responsive wrapper: fill container, maximum `342px`, and minimum `24px` horizontal margins.
- Approved viewports: `360 x 800`, `390 x 844`, and `430 x 932`.
- Supporting text: `Primary/Text Accessible` `#376FB5` (`VariableID:278:2`); welcome contrast: `4.74:1`; recommended badge contrast: `4.62:1`; button height: `56px`; bottom spacing: `24-28px`.
- Motion: `350ms` initial delay, Smart Animate, Ease Out, `500ms`.
- Reduced motion: render the Ready state immediately.
- The welcome screen is approved for frontend implementation.

### Approved onboarding Figma flow contract

Approved screen groups:

| Screen group | Approved Figma nodes |
|---|---|
| Welcome | `195:646`, `195:631` |
| Q1 Category | `230:646`, `230:692` |
| Q2 Subject Direction | `235:681`, `235:723` |
| Q3 Previous Exam | `238:710`, `238:748`, `238:799` |
| Previous Result | `240:754`, `240:827` |
| Target Level | `242:819`, `242:884`, `242:954`, `242:1011` |
| Exam Time | `245:925`, `245:986`, `245:1051`, `245:1103` |
| Weak Topics primary states | `249:1019`, `249:1131`, `249:1223`, `249:1341`, `249:1418`, `249:1506` |
| Weak Topics removal/exclusive states | `282:1648`, `282:1755`, `282:1862`, `282:1969`, `282:2076`, `282:2183`, `282:2290`, `282:2377` |
| Daily Time | `254:9190`, `254:9242`, `254:9295`, `254:9347` |
| Weekly Days | `259:1357`, `259:1408`, `259:1460`, `259:1511` |
| Essay Level | `260:1439`, `260:1489`, `260:1540`, `260:1590` |
| Current Preparation | `261:1533`, `261:1584` |
| Returning Choice | `264:1574`, `264:1630`, `264:1686` |
| First-Time Complete | `268:1637` |

Approved reusable components:

| Component | Figma node |
|---|---:|
| `Onboarding/Option Card` | `229:663` |
| `Onboarding/Multi-select Card` | `248:1037` |
| `Onboarding/Path Choice Card` | `263:1653` |
| Approved `TA’LIMOT` logo | `210:40` |

Implementation interaction contract:

- Figma interactions are representative; annotation `282:2464` records this scope.
- Every approved option must be interactive and keyboard accessible in the frontend, with exact values, validation, branching, back navigation, and selected states preserved.
- Weak Topics permits `1-3` selections. At `3/3`, additional choices are blocked while selected topics remain removable.
- `Hozircha aniq bilmayman` is exclusive and clears all topic selections; selecting another topic clears the exclusive value.
- Returning Roadmap continues to `/diagnostika`; Returning Mock continues to `/tests`.
- First-Time Complete primary continues to `/yol-xaritasi`; its optional diagnostic continues to `/diagnostika`.
- Reduced motion uses immediate state changes.
- Responsive QA passes at `360 x 800`, `390 x 844`, and `430 x 932`.
- Complete onboarding Figma design status: approved for frontend implementation.
- `/onboarding` welcome and complete question-flow frontend status: implemented.
- Both returning and first-time branches are implemented.
- Every approved option is interactive and keyboard accessible.
- Branch pruning, back navigation, weak-topic limits, exclusive `Hozircha aniq bilmayman` behavior, responsive layouts, focus management, and reduced motion are implemented.
- The onboarding flow engine has `23` passing tests.
- Manual UI QA passes at `360 x 800`, `390 x 844`, and `430 x 932`.
- Current answers are controlled in-memory only and reset after reload or navigation.
- Server persistence, authentication, API submission, analytics, resume behavior, and the `/diagnostika`, `/tests`, and `/yol-xaritasi` destination implementations remain pending.
- The complete onboarding backend contract is **not implemented** and must not be treated as complete.

### Final exam and scoring contract

| Contract | Frozen value |
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

Required calculation and presentation:

- Keep all calculations at full precision internally.
- Display objective and essay section scores with 2 decimals.
- `rawCombinedTotal = objectiveScore + essayScore`.
- `certificateScore = rawCombinedTotal / 2`.
- Round `certificateScore` to 1 decimal before level assignment.
- Assign levels from the rounded certificate score: A+ `70.0-75.0`, A `65.0-69.9`, B+ `60.0-64.9`, B `55.0-59.9`, C+ `50.0-54.9`, C `45.0-49.9`; below `45.0` means certificate level not achieved.

Questions 1-44 have a raw maximum of 76 and are normalized with `objectiveScore = (earnedRawObjective / 76) * 75`. Frozen raw weights: Q1-3 `1.1` each; Q4 `1.7`; Q5-6 `1.1` each; Q7 `1.7`; Q8 `2.5`; Q9-11 `1.7` each; Q12 `2.5`; Q13-22 `1.7` each; Q23-27 `1.1` each; Q28-32 `2.5` each; Q33-36 `1.7` each; Q37 `2.5`; Q38-39 `1.7` each; Q40a `1.2`; Q40b `1.3`; Q41a-Q44a `0.8` each; Q41b-Q44b `0.9` each.

Q40-Q44 sub-answers `a` and `b` are scored independently. Each sub-answer receives its complete configured raw weight or zero; there are no additional partial points within one sub-answer.

The essay uses 12 criteria, each restricted to `0`, `0.5`, `1`, `1.5`, or `2`, for a raw maximum of 24. The criteria are Publitsistik uslub; Qarashlar va shaxsiy fikr; Dalillash; Kirish-asosiy qism-xulosa; Matn qurilishi va xatboshilar; Izchillik va takror; Imlo; Punktuatsiya; Qo‘shimcha qo‘llash; So‘z qo‘llash uslubiyati; Leksik xilma-xillik; Nutq sofligi. Apply the official UZBMB criteria plus Sardor Toshmuhammadov's structure rules.

Essay conversion must use the immutable lookup rows exactly: `24→75`, `23.5→74`, `23→73`, `22.5→72`, `22→71`, `21.5→70`, `21→69`, `20.5→68`, `20→67`, `19.5→66`, `19→65`, `18.5→64`, `18→63`, `17.5→62`, `17→61`, `16.5→60`, `16→59`, `15.5→58`, `15→57`, `14.5→56`, `14→55`, `13.5→54`, `13→53`, `12.5→52`, `12→51`, `11.5→50`, `11→49`, `10.5→48`, `10→47`, `9.5→46`, `9→45`, `8.5→44`, `8→43`, `7.5→42`, `7→41`, `6.5→40`, `6→39`, `5.5→38`, `5→37`, `4.5→36`, `4→35`, `3.5→34`, `3→33`, `2.5→32`, `2→31`, `1.5→30`, `1→29`, `0.5→28`, `0→0`. Never use a formula or interpolation.

An AI-only result is the final platform result when teacher review is not purchased. When Teacher + AI review is purchased, the completed teacher result replaces the student-visible AI result for that exact essay submission version.

Every published test and submitted attempt/result retains its immutable scoring-policy, question revision, raw-weight, rubric, structure-rule, and matrix versions. Published tests are reviewed and immutable. Do not implement post-submission question invalidation: a correction creates a new revision and test version, and historical results remain unchanged.

### Confirmed standalone learning routes

| Route | Experience |
|---|---|
| `/mavzular` | Topic-practice catalogue for Fonetika, Morfemika, Uslubiyat, Morfologiya, Sintaksis, G‘azal, Ilmiy matn, and Badiiy matn |
| `/mavzular/:slug` | One topic module’s detail, progress, available quizzes, and history |
| `/mashqlar/:quizId` | Standalone topic-quiz runner, separate from the full mock |
| `/esse-tekshirish` | Standalone essay topic, submission, evaluation, history, and human-review status |
| `/onboarding` | Welcome and the ordered one-question-at-a-time onboarding flow |
| `/diagnostika` | Versioned free 15-question diagnostic |
| `/yol-xaritasi` | Adaptive roadmap with `Noldan sertifikatgacha` and `Natijani oshirish` modes plus `To‘liq yo‘l`, `Bu hafta`, and `Natijalar` views |

### Frozen practice, essay, and Tanga contracts

- Standard practice quiz: 20 equal-value questions, 30 minutes, result out of 100%.
- G‘azal: complete g‘azal plus 5 equal-value questions, 20 minutes.
- Ilmiy matn and Badiiy matn: one complete text plus 5 equal-value questions, 20 minutes.
- Free quiz: maximum 2 attempts per immutable version. Paid quiz: 1 Tanga and maximum 3 attempts per immutable version.
- Best result drives progress: below 60% `Needs improvement`, 60-79% `Good`, and 80-100% `Mastered`.
- Standalone AI essay check: 2 Tanga; the first AI check per account is free; AI result due within 15 minutes and labelled as AI assessment.
- Teacher + AI essay check: 6 Tanga; the frozen overall delivery target remains 24 hours. A separate 15-minute review SLA begins when the teacher accepts; teacher result replaces the student-visible AI result.
- Sardor Toshmuhammadov is the only launch teacher; capacity is 15 reviews per day, automatically assigned FIFO.
- Full capacity shows `Bugungi o‘rinlar tugadi` and the next available date. Reserve the slot before atomically deducting 6 Tanga.
- Essay scoring uses the versioned official 12-criterion UZBMB rubric, Sardor Toshmuhammadov’s structure rules, and fixed `24 -> 75` lookup matrix.
- Paid mock test: 2 Tanga.
- Tanga packages: 7 for 21,000 so‘m; 15 for 40,000 so‘m; 30 for 88,000 so‘m.
- Manual card-payment statuses are `Pending`, `Approved`, `Rejected`, `Cancelled`, and `Reversed`. All Tanga movement is an immutable ledger entry; no numeric balance is directly edited or history deleted.
- Manual card-transfer top-up is website-only. The Telegram Mini App must not expose card details, transfer instructions, receipt upload, or card-transfer purchase actions.
- Onboarding welcome copy is exactly: `Xush kelibsiz!`, `Biz bilan A+ darajaga erishing!`, `Milliy sertifikat sari ishonchli yo‘lingizni birgalikda boshlashga tayyormisiz?`; button: `Boshlash`.
- Onboarding asks the 11 confirmed questions one at a time in the approved order and supports a short elegant entrance animation with reduced-motion behavior.
- Diagnostic items are equal-value. Readiness bands are `0-39% Boshlang‘ich`, `40-59% Rivojlanayotgan`, `60-79% Yaxshi`, and `80-100% Kuchli`; they are not certificate grades. Incorrect and self-selected weak topics are prioritized, the roadmap begins with the three weakest, and a completed 20-question topic quiz replaces that topic's diagnostic estimate.
- Essay topics use `Draft -> Published -> Archived`. Resubmissions/edits create separately paid immutable attempts, the first-ever AI entitlement remains single-use, and teacher review binds to the exact submitted essay version.
- Teacher policy timezone is `Asia/Tashkent`. Pre-acceptance cancellation returns 6 Tanga; post-acceptance cancellation is unavailable; missing the 15-minute accepted-review SLA returns 6 Tanga while review still completes.
- Manual top-up requires receipt image, payer full name, and transfer date/time. Approval alone credits Tanga; rejection/cancellation/reversal rules use recorded state history and compensating ledger entries. Negative balance blocks purchases.

### Approved implementation inventory

The Figma handoff marks these pages as requiring implementation:

| Figma page | Approved frames | Purpose |
|---|---:|---|
| 05 - Student High Fidelity | 37 | Entry, authentication, dashboard, catalogue, topics, test detail, shared states |
| 06 - Exam Engine | 48 | Exam shell, question types, saving/offline, review, submission |
| 07 - Essay and Results | 56 | Typed/handwritten essay, review status, results, explanations |
| 08 - Payments and Profile | 59 | Packages, checkout, payment states, profile, settings, support |
| 10 - Admin High Fidelity | 62 | Admin, reviewer, and teacher workflows |
| **Total** | **262** | Every frame is enumerated in section 9 |

Pages 02, 03, and 09 are approved design-system/component references, not routes. Pages 00, 01, 04, 11, 12, and 13 are reference/documentation. Page 99 is archive and is excluded. Hidden wireframe section `35:3` is excluded as superseded.

### Viewports controlled by Figma

- Student primary viewport: `390 x 844`.
- Student responsive QA: `360 x 800` and `430 x 932`; support the PDF test widths `320, 360, 375, 390, 412, 430, 480`.
- Student layout remains single-column through 430 px, with no horizontal overflow, safe-area-aware fixed controls, browser zoom, keyboard-open handling, long Uzbek text, poetry line breaks, and reduced-motion support.
- Admin primary viewport: `1440 x 1024`; dense workspaces use `1600 x 1100`.
- Admin tablet QA: `1024 x 768`, collapsed sidebar, contained table scrolling, fitting drawers, and no covered content.

## 2. Shared implementation contracts

### Component bundles

The component names below are implementation labels for the approved Page 03/Page 09 component designs; they are not permission to redesign them.

| Bundle | Required components |
|---|---|
| `M-SHELL` | Safe-area container, mobile header, scroll region, sticky action region, bottom navigation outside active exams, theme provider |
| `AUTH` | Labelled text field, phone input, password field, checkbox, primary/secondary button, verification-code input, field/form error summary |
| `DISCOVERY` | Search field, segmented control, filter chips, test/topic cards, metric cards, status badge, empty state, filter sheet |
| `EXAM` | Exam header, server timer, progress, stimulus viewer, question renderer, question option, text/textarea answer, matching sheet, ordering controls plus non-drag alternative, navigator cells, bookmark, autosave status, connectivity banner, sticky previous/next |
| `PRACTICE` | Topic module card, configurable quiz summary, `EXAM` question/stimulus controls without full-mock identity, quiz progress, autosave, completion, score, explanations, retry |
| `ESSAY` | Method card, essay prompt, textarea/editor, word/paragraph counter, draft status, review summary, confirmation dialog |
| `ESSAY-CHECK` | Topic selector, `ESSAY`, `UPLOAD`, AI-evaluation state, versioned 75-point criterion breakdown, mistakes, recommendations, history, teacher-review status |
| `ONBOARDING` | Welcome copy and entrance motion/reduced-motion variant, one-question stepper, progress, conditional previous-level step, 1-3 topic multiselect, single-choice controls, branch actions, diagnostic invitation, roadmap status |
| `ROADMAP` | Mode control, `To‘liq yo‘l` connected map, `Bu hafta` seven-day plan, `Natijalar` score/history view, connected nodes/edges, node status, score, estimated time, action, recommendation reason, pacing and required/recommended/optional labels |
| `TANGA` | Tanga balance derived from ledger, service-price label, package cards, manual-payment evidence/status, immutable transaction history, insufficient-funds state, atomic reservation/charge confirmation |
| `UPLOAD` | Camera/file picker, page preview, upload progress, quality warning, rotate/replace/delete/reorder controls plus keyboard alternative, per-page retry |
| `RESULTS` | Score summary, preliminary/final badge, topic bars with text alternatives, result cards, attempt history, item outcome, explanation sheet, report form |
| `COMMERCE` | Package card/comparison, order summary, provider-launch state, payment timeline, payment/entitlement status split, receipt, ledger/history list |
| `PROFILE` | Profile summary, editable form, connected account list, session list, settings rows, switch/radio controls, destructive confirmation |
| `A-SHELL` | Admin sidebar, top bar, page header, role-aware navigation, permission guard, responsive tablet shell |
| `A-TABLE` | Server-paginated table, URL-backed search/filter/sort, sticky headers, selection/bulk actions, pagination, loading/empty/error/restricted states |
| `A-EDITOR` | Structured rich-text editor, type-specific question form, answer-key editor in a protected boundary, stimulus editor, validation summary, mobile preview, revision/version comparison |
| `A-REVIEW` | Assignment/claim state, content viewer, rubric form, autosave, calculated totals, student/public feedback separated from private notes, conflict dialog |
| `A-SAFE-ACTION` | Explicit confirmation, reason field, impact statement, idempotency/version handling, permission failure, audit result |

### State contract

Every data-backed route must implement these states even when Figma shows only representative frames:

| State | Required behavior |
|---|---|
| Loading | Preserve the shell; use the approved skeleton/spinner; prevent duplicate mutation; announce meaningful progress only |
| Empty | Explain whether data does not exist or filters returned no matches; offer a safe next action |
| Error | State what failed, whether user data is safe, a recovery action, secondary navigation, and a support `requestId`; never show only a generic failure |
| Offline | Student reads may use explicitly safe cached data. Exam answers and typed essay drafts use durable IndexedDB queues. Never claim “server saved” before acknowledgement. Admin offline mutation behavior is not approved and remains a decision |

Additional rules:

- Active exam payloads must never include `AnswerKey`, correct options, accepted answers, protected scoring configuration, or premature explanations.
- All student object access derives the user from the server session and checks ownership.
- All writes validate input, define idempotency, rate limits, transaction boundaries, allowed state transitions, safe errors, and audit requirements.
- Dates are stored in UTC. Tanga and other credits are integer ledger units; money uses integer minor units or decimal-safe types, never binary floating point.
- Published tests store the immutable scoring-policy version. Submission freezes that version onto the attempt/result path, and every historical `AttemptResult` retains it.
- Light/dark mode uses approved semantic tokens. Blue means interaction/selection; green means correct/complete. State is never conveyed by color alone.

### Authentication and permissions

| Surface | Requirement |
|---|---|
| Public/auth | Telegram raw `initData` is validated server-side; browser login is rate-limited and generic on failure |
| Student | Database-backed secure session; `STUDENT`; own attempts, answers, essays, uploads, results, payments, entitlements, profile, sessions, bookmarks, and reports only |
| Admin shell | Separate route group, MFA, short idle timeout, revocable sessions, permission check on every request, login/privilege audit |
| Content | PDF roles `CONTENT_EDITOR` and `REVIEWER`; published revisions immutable; optional two-person review prevents self-approval |
| Essay | PDF role `TEACHER`; only assigned or permitted-pool submissions; exclusive claim/finalization |
| Finance | `FINANCE_ADMIN`; payment/refund/ledger permissions only, with reason and audit |
| Administration | `ADMIN`; broad operations within policy |
| Security administration | `SUPER_ADMIN`; role/security/admin-account management; very limited accounts |

## 3. Student entry, discovery, and test-start map

### Frozen onboarding and diagnostic contract

`/onboarding` presents the following exact single-step choices:

| Step | Prompt | Approved options |
|---:|---|---|
| 1 | Siz qaysi toifaga kirasiz? | Maktab o‘quvchisiman; Abituriyent yoki talabaman; Ona tili o‘qituvchisiman |
| 2 | Milliy sertifikat sizga qaysi yo‘nalish uchun kerak? | Asosiy fan sifatida; Majburiy fan sifatida |
| 3 | Milliy sertifikat imtihonini avval topshirganmisiz? | Ha, topshirganman; Yo‘q, birinchi marta topshiraman |
| 4 | Oxirgi natijangiz qaysi daraja edi? | A+; A; B+; B; C+; C; Sertifikat ololmaganman; Natijamni eslay olmayman. Show only after `Ha, topshirganman` |
| 5 | Qaysi darajaga erishishni maqsad qilgansiz? | A+; A; B+; B; C+; C |
| 6 | Milliy sertifikat imtihonigacha qancha vaqtingiz bor? | 1 oydan kam; 1-2 oy; 3-4 oy; 5 oy yoki undan ko‘p; Imtihon sanasini hali tanlamaganman |
| 7 | Qaysi mavzularda ko‘proq qiynalasiz? | Fonetika; Morfemika; Uslubiyat; Morfologiya; Sintaksis; G‘azal; Ilmiy matn; Badiiy matn; Esse yozish; Hozircha aniq bilmayman. Select 1-3 |
| 8 | Tayyorgarlik uchun kuniga qancha vaqt ajrata olasiz? | 30 daqiqagacha; 30-60 daqiqa; 1-2 soat; 2 soatdan ko‘p; Har kuni vaqt ajrata olmayman |
| 9 | Haftasiga necha kun tayyorlana olasiz? | 1-2 kun; 3-4 kun; 5-6 kun; Har kuni |
| 10 | Esse yozish bo‘yicha o‘zingizni qanday baholaysiz? | Hali esse yozishni boshlamaganman; Tuzilmani bilaman, lekin yozishda qiynalaman; Esse yoza olaman, ammo xatolarim ko‘p; Yaxshi yozaman, ballimni oshirmoqchiman; Darajamni aniq bilmayman |
| 11 | Ona tili bo‘yicha hozirgi tayyorgarligingiz qanday? | Hammasini noldan boshlamoqchiman; Asosiy qoidalarni biroz bilaman; Mavzularni o‘rganganman, lekin testlarda qiynalaman; Bilimim yaxshi, menga tizimli reja kerak. First-time users only; select exactly one |

`/diagnostika` contains exactly 15 questions: Fonetika 1, Morfemika 1, Uslubiyat 1, Morfologiya 2, Sintaksis 2, G‘azal 2, Ilmiy matn 3, and Badiiy matn 3.

Previous exam takers choosing `Shaxsiy yo‘l xaritasini olish` begin with `/diagnostika`; their alternate action opens `/tests`. First-time users receive a response-based preliminary `/yol-xaritasi`; their diagnostic is optional, and completion replaces the preliminary roadmap with an accurate roadmap.

Diagnostic-to-roadmap calculation is frozen:

- each of the 15 questions has equal value;
- total percentages map to readiness levels `0-39 Boshlang‘ich`, `40-59 Rivojlanayotgan`, `60-79 Yaxshi`, and `80-100 Kuchli`;
- readiness levels are stored and displayed separately from certificate grades;
- topic priority combines incorrect diagnostic topics and self-selected weak topics;
- the first roadmap version starts with the three weakest topics;
- completion of a standard 20-question topic quiz replaces the active diagnostic estimate for that topic without changing historical diagnostic data.

### Approved adaptive roadmap contract

Status:

- Product contract: **approved**.
- Complete Figma roadmap redesign: **completed and approved**.
- Frontend roadmap implementation: **not started**.
- Backend generation and recalculation: **not started**.
- Persistence and immutable versioning: **not started**.
- Authentication and API integration: **not started**.

Approved roadmap screens:

| Mode | View | Figma screen | Route |
|---|---|---:|---|
| `Noldan sertifikatgacha` | `To‘liq yo‘l` | `303:1991` | `/yol-xaritasi?mode=from-zero&view=full` |
| `Natijani oshirish` | `To‘liq yo‘l` | `328:977` | `/yol-xaritasi?mode=boost&view=full` |
| `Noldan sertifikatgacha` | `Bu hafta` | `337:438` | `/yol-xaritasi?mode=from-zero&view=week` |
| `Natijani oshirish` | `Bu hafta` | `343:404` | `/yol-xaritasi?mode=boost&view=week` |
| `Noldan sertifikatgacha` | `Natijalar` | `351:563` | `/yol-xaritasi?mode=from-zero&view=results` |
| `Natijani oshirish` | `Natijalar` | `358:469` | `/yol-xaritasi?mode=boost&view=results` |

Approved `Yo‘l xaritasi/Tugun` component set:

| Variant | Figma node |
|---|---:|
| Component set | `302:2089` |
| `Qulflangan` | `302:1991` |
| `Mavjud` | `302:2003` |
| `Jarayonda` | `302:2015` |
| `Takrorlash kerak` | `302:2027` |
| `Yaxshi` | `302:2039` |
| `O‘zlashtirilgan` | `302:2051` |
| `Ixtiyoriy` | `302:2063` |
| `O‘tilmaydi` | `302:2075` |

Approved `Yo‘l xaritasi/Haftalik vazifa` component set:

| Variant | Figma node |
|---|---:|
| Component set | `337:437` |
| `Bugun` | `337:377` |
| `Rejalashtirilgan` | `337:389` |
| `Bajarildi` | `337:401` |
| `Takrorlash kerak` | `337:413` |
| `Ko‘chirildi` | `337:425` |

All six approved roadmap screens passed:

- content and Uzbek-language QA;
- responsive QA at `360 x 800`, `390 x 844`, and `430 x 932`;
- vertical scrolling and sticky-action QA;
- component-attachment QA;
- WCAG AA contrast and accessibility QA;
- dynamic-data annotation QA.

`/yol-xaritasi` supports two modes:

1. `Noldan sertifikatgacha`;
2. `Natijani oshirish`.

Both modes expose:

1. `To‘liq yo‘l` — the complete connected learning map;
2. `Bu hafta` — a personalized seven-day execution plan, not the complete roadmap;
3. `Natijalar` — topic scores, completion, and progress history.

`Noldan sertifikatgacha` maps these dependencies:

- `Poydevor`: `Fonetika -> Morfemika`;
- `Grammatika`: `Morfologiya -> Sintaksis`;
- `Matn va uslub`: `Uslubiyat -> Ilmiy matn` and `Uslubiyat -> Badiiy matn`;
- `Adabiy tahlil`: `G‘azal` is available after `Grammatika`;
- `Esse` is available after both `Sintaksis` and `Uslubiyat`;
- `Mustahkamlash`: topic quizzes, mixed practice, and error review;
- `Imtihon tayyorgarligi`: `To‘liq mock imtihon`, `Xatolar tahlili`, `Zaif mavzu va ko‘nikmalar ustida ishlash`, `Esse tekshiruvi`, and `Yakuniy to‘liq mock imtihon`.

`Natijani oshirish`:

- establishes a baseline from a previous result, diagnostic, or full mock and compares current result with target;
- splits into an objective-score branch with the three weakest topics, targeted review, quiz, and error analysis;
- splits into an essay-score branch with weak rubric criteria, structure, argumentation, literacy, and essay checking;
- joins into `To‘liq mock imtihon`, `Xatolar tahlili`, `Zaif mavzu va ko‘nikmalar ustida ishlash`, `Esse tekshiruvi`, and `Yakuniy to‘liq mock imtihon`;
- may skip mastered topics while keeping them optionally available.

Roadmap node statuses are exactly `Locked`, `Available`, `In progress`, `Takrorlash kerak`, `Yaxshi`, `O‘zlashtirilgan`, `Optional`, and `Skipped because already mastered`.

Progression:

- below `60%` is `Takrorlash kerak` and automatically returns the topic or skill to `Bu hafta`;
- `60-79%` is `Yaxshi`;
- `80-100%` is `O‘zlashtirilgan`;
- below `60%` never permanently blocks later topics;
- completing at least one required activity unlocks progression;
- paid attempts and teacher checking never gate roadmap unlocking;
- AI essay checking is sufficient, and teacher checking is optional.

Pacing maps `Less than 1 month -> Intensive`, `1-2 months -> Accelerated`, `3-4 months -> Balanced`, `5+ months -> Foundation-focused`, and `No exam date -> Flexible rolling plan`.

The complete roadmap remains visible at every pace. Timing changes priority, weekly workload, required/recommended/optional labels, and estimated completion. `Bu hafta` uses available days, daily study time, the three highest-priority weaknesses, incomplete prerequisites, and essay/mock requirements.

The existing three-weakest-topics rule drives initial priority and `Bu hafta`; it does not hide the remaining `To‘liq yo‘l` graph or replace its dependencies.

Recalculate after a diagnostic, topic quiz, essay check, mock result, or exam-date change. Exact exam date is optional; otherwise use the selected time range. Roadmap versions and prior progress are immutable.

Responsive presentation:

- mobile: vertical connected roadmap;
- desktop: branched interactive map inspired by roadmap-style learning maps, using the `TA’LIMOT` visual system and not copying roadmap.sh;
- every node: status, topic, score, estimated time, action, and recommendation reason.

The earlier Figma `Roadmap — Approved Flow` section (`292:1980`) and `Preliminary Roadmap — First-Time` frame (`292:1981`) are superseded design history. The simple preliminary-summary and seven-day-only presentation is **not approved for implementation**.

| Figma frames | UI route | Role | Components | Loading / empty / error / offline | Backend domain and PDF API requirements | Database entities | Auth and permission |
|---|---|---|---|---|---|---|---|
| 05.01.01 | `/` launch state; authenticated redirect to intended page, active attempt, or `/dashboard` | Public -> student | `M-SHELL`, auth progress | Loading shown; auth error routes to 05.01.05; offline launch requires network and states that saved active-attempt data is safe | Auth: `POST /api/auth/telegram`, then `GET /api/me`, `GET /api/dashboard`; validate signature, `auth_date`, account status, constant-time comparison, create own platform session | User, Profile, AuthIdentity, Session, UserRole, AccountRestriction | Telegram data is untrusted until backend validation; blocked/deleted policy enforced |
| Approved onboarding flow nodes listed in the onboarding Figma contract above | `/onboarding` | Student | `M-SHELL`, `ONBOARDING`; approved `TA’LIMOT` component `210:40`; `Onboarding/Option Card` `229:663`; `Onboarding/Multi-select Card` `248:1037`; `Onboarding/Path Choice Card` `263:1653`; exact welcome copy, `Boshlash`, and frozen one-question-at-a-time options above; fill-width wrapper capped at `342px` with at least `24px` margins | Approved `360 x 800`, `390 x 844`, and `430 x 932`; accessible text token `#376FB5`; `56px` button; `24-28px` bottom spacing; `350ms` welcome delay then Smart Animate/Ease Out over `500ms`; representative question transitions use `200ms`; reduced motion uses immediate state changes; step loading; conditional branching; selection-limit validation; safe-input preservation; offline submission unavailable; incomplete/resume state | Onboarding: persist the 11 ordered responses and branch safely; validate every answer against the versioned approved option set; exact API path is an implementation contract, not a product blocker | OnboardingSession, OnboardingOptionSetVersion, OnboardingResponse/Answer | Authenticated account owns responses; client cannot submit unapproved option values |
| Missing high-fidelity diagnostic screens | `/diagnostika` | Student | `M-SHELL`, `EXAM`, diagnostic intro/progress/result | Loading; unavailable blueprint; durable autosave/offline queue; completion/error; resume | Diagnostics: deliver exactly 15 frozen items with topic distribution `1/1/1/2/2/2/3/3`; started attempts bind an immutable diagnostic version | DiagnosticBlueprint, DiagnosticVersion, DiagnosticVersionTopic, DiagnosticVersionItem, DiagnosticAttempt, DiagnosticAnswer/Version, DiagnosticResult | Own diagnostic only; admin edits draft topics, but published versions and active attempts are immutable |
| Approved roadmap screens `303:1991`, `328:977`, `337:438`, `343:404`, `351:563`, and `358:469`; earlier preliminary frame `292:1981` superseded | `/yol-xaritasi?mode={from-zero|boost}&view={full|week|results}` | Student | `M-SHELL`, `ROADMAP`; approved `Yo‘l xaritasi/Tugun` set `302:2089`; approved `Yo‘l xaritasi/Haftalik vazifa` set `337:437`; two modes; three views; responsive connected nodes/edges; status, topic, score, estimated time, action, reason; pacing and required/recommended/optional labels | Loading; no baseline; generating/recalculating; empty weekly plan; stale cached version with freshness; partial source failure; offline immutable cached read only | Roadmaps: generate the frozen dependency graph or baseline-improvement branches; prioritize and schedule without paid gates; recalculate on diagnostic/quiz/essay/mock/exam-date inputs; preserve every roadmap version and prior progress; exact API paths remain pending | Roadmap, RoadmapVersion, RoadmapMode, RoadmapNode, RoadmapEdge, RoadmapNodeStatus/History, RoadmapBaselineSnapshot, RoadmapTopicPriority, WeeklyPlan/Version/Item, RoadmapProgressEvent, PacingProfile; OnboardingSession, DiagnosticResult/TopicResult, TopicPracticeResult, EssayEvaluation, AttemptResult | Own roadmap only; server validates source ownership, generation rules, unlocks, recalculation, and immutable lineage; client cannot forge scores/statuses or bypass prerequisites |
| 05.01.03 | `/auth/login` | Public | `AUTH` | Submitting, field/form error, rate-limit state, offline unavailable | Auth: `POST /api/auth/login`, password reset endpoints; Argon2id, generic login error, session rotation | User, Credential, AuthIdentity, Session, AccountRestriction | Authenticated users redirect to intended safe route |
| 05.01.04 | `/auth/register` | Public | `AUTH` | Submitting, verification state, validation error, offline unavailable | Auth: `POST /api/auth/register`; verification code only after a real SMS/email provider is selected; single-use, short-lived, hashed, rate-limited | User, Profile, Credential, AuthIdentity, Session, accepted terms record **TBD entity** | Prevent enumeration and duplicate identity ownership |
| 05.01.05, 05.06.08 | Current auth route state; no separate route approved | Public/session-expired | `AUTH`, error state | Retry, browser fallback, help; session-expired preserves intended route | Auth endpoints above; revoke/expire session safely | Session, User, AuthIdentity | No protected data rendered after expiry |
| 05.02.01-05.02.04, 05.07.01, 05.07.03 | `/dashboard` | Student | `M-SHELL`, `DISCOVERY` | Loading/empty/new-student/error/offline cached summary; notification preview is an overlay with **TBD deep-link behavior** | Users/Attempts/Results/Access/Notifications: `GET /api/dashboard`; response includes active attempt, available tests, last result, package/credits, pending essay, weak topics, bookmarks, notices | User, Profile, Attempt, AttemptResult, TopicResult, Entitlement, CreditAccount, Notification, SavedQuestion **(entity name not fixed in PDF catalogue)** | Own aggregate data only; no answer keys |
| 05.03.01-05.03.05, 05.07.02, 05.07.04-05.07.05 | `/tests`; query string for search/filter/sort | Student | `M-SHELL`, `DISCOVERY` | Skeleton; no-data vs no-results; retry; cached offline read allowed only if freshness/access labels are clear | Tests/Access: `GET /api/tests`; filters/sorts, published/available versions only, explicit access state and personal attempt limits | Test, TestVersion, TestAccessRule, Attempt, Entitlement, Product, ProductPrice | Session required for personal state; catalogue serialization excludes protected content |
| 05.04.01 | `/mavzular` | Student | `M-SHELL`, `DISCOVERY`, `PRACTICE`, progress cards | Loading; empty/no history; error; safe cached analytics may be read offline | Topic Practice/Content/Results: list the eight launch modules and any later administrator-added published modules; return available quiz versions, access type, eligibility, best percentage, and progress band. Exact endpoint naming is an implementation choice | TopicPracticeModule, TopicQuiz, TopicQuizVersion, TopicPracticeResult; module slugs unique and published versions immutable | Own progress only; topic practice is separate from full-mock attempts/results; admins manage module lifecycle |
| 05.04.02-05.04.04 | `/mavzular/:slug` | Student | `DISCOVERY`, `PRACTICE`, result/recommendation/history cards | Loading; no quizzes/no attempts; attempt-limit reached; insufficient Tanga; error; cached read only | Topic Practice/Results: module detail, immutable versions, best-result progress, history, explanations availability, and server-authoritative retry eligibility. Free versions allow 2 attempts; paid versions cost 1 Tanga and allow 3. Exact endpoint naming is an implementation choice | TopicPracticeModule, TopicQuiz, TopicQuizVersion, TopicQuizVersionItem, TopicPracticeAttempt, TopicPracticeResult, TangaLedgerEntry | Own progress; published quiz configuration is server-authoritative; no charge until atomic attempt creation succeeds |
| Reuse 06.01-06.05, 06.07, 07.05-07.06 components; standalone shell is missing from Figma | `/mashqlar/:quizId` | Student | `PRACTICE`, `EXAM`, `RESULTS`; no full-mock title, 45-item contract, or full-mock timer assumptions | Progress, durable autosave, offline queue, completion, percentage, explanations, retry; attempt-limit/insufficient-Tanga states; loading/empty/error/offline follow the shared contract | Topic Practice: standard quizzes deliver 20 questions in 30 minutes. Ilmiy/Badiiy matn deliver one complete text + 5 questions in 20 minutes. G‘azal delivers the complete g‘azal + 5 questions in 20 minutes. Questions are equal-value and the result is `/100%`. Best result maps to `<60`, `60-79`, `80-100` bands. Start, optional 1-Tanga deduction, attempt creation, and limit enforcement are atomic/idempotent. Exact endpoint naming is an implementation choice | TopicQuizVersion with kind/count/duration/access/attempt-limit/scoring-policy snapshot; TopicQuizVersionItem; TopicPracticeAttempt; TopicPracticeAnswer/Version; TopicPracticeResult with percentage/bestPercentage/progressBand; TangaLedgerEntry for paid start. A shared engine is permitted only with an explicit non-mock discriminator | Own practice attempt only; published quiz/version frozen; protected answers excluded until completion; server enforces version-scoped limits |
| 05.05.01-05.05.04 | `/tests/:testId` (Figma parameter); PDF catalogue API resolves by slug and access API by ID | Student | `M-SHELL`, `DISCOVERY`, `TANGA`, test detail/status cards | Loading; unavailable/locked/insufficient-Tanga state; error; offline read only if cached and clearly stale | Tests/Access: return exactly 45 displayed items, 180-minute duration, objective `/75`, essay `/75`, raw combined `/150`, certificate `/75`, frozen scoring-policy version, access/attempt policy, and server price quote. A paid mock costs 2 Tanga | Test, TestVersion, TestSection, TestVersionItem, TestAccessRule, ScoringPolicyVersion, Attempt, AttemptResult, Entitlement, TangaLedgerEntry | Published version only; server access and price decision authoritative |
| 05.05.05-05.05.06 | **TBD instructions subroute/state**; Figma specifies a push transition but no path | Student | `M-SHELL`, `TANGA`, instruction cards, acknowledgement checkbox | Loading inherited; insufficient Tanga; error returns safely; offline cannot start | Attempts/Access/Tanga: start only after acknowledgement; atomically freeze version, enforce attempt policy, deduct 2 Tanga for a paid mock, create attempt, and start server timer; idempotency prevents duplicate deduction | Attempt, AttemptItem, AttemptEvent, TestVersion, TestAccessRule, Entitlement, TangaLedgerEntry | Authenticated active student; server enforces policy; client cannot deduct or start independently |
| 05.06.01-05.06.04 | Overlay on `/tests` or `/tests/:testId`; deep-link URL **TBD** | Student | Dialog/sheet, `DISCOVERY`, `A-SAFE-ACTION` behavior for restart | Existing-attempt, locked-access, filter state; error preserves current data; offline cannot create/restart | Attempts/Access/Products: attempt start/resume APIs, `GET /api/tests/:id/access`, `GET /api/products`; restart must obey fixed policy and audit access return/consumption | Attempt, AttemptEvent, TestAccessRule, Entitlement, CreditLedger, Product | Own attempt only; server decides resume/restart/access |
| 05.06.05-05.06.07 | Route-scoped system states | Public/student depending route | Approved loading/error/offline state components | Exact frames are the generic contract | The current route’s read API; retries use request IDs; no blind mutation retry | Route-dependent | Route guard remains in force |

## 4. Exam engine map

All exam screens use the active-attempt shell. The client may optimistically render an answer, but the server owns attempt state, time, access, revisions, and accepted answers.

| Figma frames | UI route | Role | Components | Loading / empty / error / offline | Backend domain and PDF API requirements | Database entities | Auth and permission |
|---|---|---|---|---|---|---|---|
| 06.01.01-06.01.05 | `/attempts/:attemptId` | Student | `EXAM` | Loading shell; empty is invalid and becomes a safe error; timer-warning/final-minute states; offline timer continues from server anchors | Attempts: `GET /api/attempts/:attemptId`, `POST .../resume`, `GET .../items/:position`; return `serverTime`, `expiresAt`, frozen item, navigator, saved answer, progress out of 45, and the frozen 180-minute policy; no protected key | Attempt, AttemptItem, AttemptAnswer, AttemptQuestionFlag, AttemptEvent, TestVersion, QuestionRevision, StimulusRevision | Own attempt; ACTIVE/resumable status; expired/submitted/cancelled redirects |
| 06.02.01-06.02.06 | `/attempts/:attemptId` with current item in server/client route state | Student | `EXAM` renderers for single, multiple, true/false, image, rich symbols | Per-item loading/error; unanswered is valid; offline edits queue | Attempts: item GET and `PUT /api/attempts/:attemptId/answers/:attemptItemId`; validate discriminated payload, client/server revision, idempotency; exclude keys/explanations | AttemptItem, AttemptAnswer, AttemptAnswerVersion, QuestionRevision, QuestionOption, MediaAsset | Own active unexpired attempt; answer shape/type enforcement |
| 06.03.01-06.03.06 | `/attempts/:attemptId`; passage/g‘azal overlays stay on attempt route; deep-link state **TBD** | Student | `EXAM`, accessible stimulus viewer, typography controls, full-screen overlay | Loading/error for stimulus; cached frozen stimulus permitted during an active offline attempt if captured at delivery | Attempts/Content: item GET returns exact StimulusRevision and linked items; preserve line breaks, rich text, alt text; sanitize renderer | AttemptItem, QuestionRevision, Stimulus, StimulusRevision, MediaAsset | Exact frozen revision only; no unrelated content access |
| 06.04.01-06.04.07 | `/attempts/:attemptId` | Student | `EXAM` text, correction, matching, ordering, fill-blank, long-answer controls | Empty answer is explicit; field errors; offline queue; keyboard-open layout | Attempts: item GET + answer PUT; explicit normalization version, manual-review policy, max lengths; ordering has non-drag controls | AttemptItem, AttemptAnswer/Version, QuestionRevision, AnswerKey protected server-side | Own active attempt; server validates payload and manual-review policy |
| 06.05.01-06.05.08 | `/attempts/:attemptId`; navigator is a sheet | Student | `EXAM` navigator, bookmark/flag, autosave, banners | Saving, saved, device-saved/offline, retrying, recoverable error, reopened state; navigation remains available while queued | Attempts: answer PUT; flag PUT/DELETE; resume POST. IndexedDB durable ordered events with stable IDs, exponential backoff, conflict response, server acknowledgement before “saved” | AttemptAnswer, AttemptAnswerVersion, AttemptQuestionFlag, AttemptEvent, Session/attempt-session token if selected | Own active attempt; stale tab/device cannot overwrite newer server revision |
| 06.06.01-06.06.03 | `/attempts/:attemptId/review` | Student | `EXAM` review summary, missing-essay warning, confirmation dialog | Loading; explicit unanswered/missing upload counts; error preserves accepted answers; offline submission waits for recoverable connectivity | Attempts/Essays: `GET .../review`; verify required uploads READY and queued answers processed; unanswered submission depends on test policy | Attempt, AttemptItem, AttemptAnswer, EssaySubmission, EssayUpload, TestVersion | Own attempt; submission eligibility computed on server |
| 06.06.04-06.06.08 | Same review route until server returns result redirect | Student | Submission progress/success/error/duplicate/expiry states | No blind auto-retry; repeat action returns same state; error states answer safety and last save; expiry follows fixed policy | `POST /api/attempts/:attemptId/submit`; atomic freeze, `SUBMISSION_REQUESTED` -> `SUBMITTED`, explicit unanswered items, immutable submission scoring-policy snapshot, scoring job, idempotency; expiry uses same domain method | Attempt, AttemptAnswer, AttemptEvent, AttemptResult, Job/outbox, EssaySubmission/ReviewAssignment when applicable | Own attempt; row lock/compare-and-set; protected against duplicate submission |
| 06.07.01-06.07.08 | Same underlying exam/review routes | Student | Dark/responsive/accessibility variants of `EXAM` | Same state contract at 360/390/430, keyboard open, long text, non-color state labels | Same APIs/entities as corresponding light screen | Same as corresponding screen | Same as corresponding screen |

## 5. Essay and results map

| Figma frames | UI route | Role | Components | Loading / empty / error / offline | Backend domain and PDF API requirements | Database entities | Auth and permission |
|---|---|---|---|---|---|---|---|
| 07.01.01-07.01.04 | `/attempts/:attemptId/essay` | Student | `ESSAY`, method cards, draft-found state | Prompt/draft loading; no draft; error preserves both versions; offline prompt requires previously delivered attempt data | Essays/Attempts: attempt GET, `PUT .../essay/text` for draft; method-selection persistence endpoint is not separately defined | Attempt, AttemptItem, QuestionRevision, EssaySubmission, EssayTextVersion, EssayRubricVersion **(catalogue naming incomplete)** | Own active attempt; allowed submission modes from frozen essay revision |
| 07.02.01-07.02.08 | `/attempts/:attemptId/essay` | Student | `ESSAY` editor/counters/save status/review/confirmation | Empty/editing/local-saved/server-saving/server-saved/offline/conflict/review/submitted; preserve newest Unicode paragraphs | Essays: `PUT /api/attempts/:attemptId/essay/text`, `POST .../essay/submit`; versioned/debounced server saves, frequent IndexedDB saves, final submission freezes content | EssaySubmission, EssayTextVersion, Attempt/Item, QuestionRevision | Own active attempt; version conflict never silently overwrites newest draft; submit idempotent |
| 07.03.01-07.03.09 | `/attempts/:attemptId/essay` | Student | `UPLOAD`, `ESSAY` | Empty, uploading, ready, quality warning, per-page failure/retry, review; offline may retain local selection but “ready” requires server receipt | Essays/Storage: create upload, finalize, patch, delete endpoints; short-lived presigned URL, server file-signature/size/dimension validation, private original + safe derivative, READY required before submit | EssaySubmission, EssayUpload, MediaAsset/object key, Job | Own submission; upload URL scoped to one object; authenticated short-lived reads |
| 07.04.01-07.04.08 | `/attempts/:attemptId/essay` or result-status entry; final route choice **TBD** | Student | `ESSAY`, processing/review timeline, safe error | Submitting, processing, ready, pending, under review, replacement requested, complete, status error; status error says essay is safe | `GET /api/essays/:submissionId/status`; worker processing; review assignment; finalization creates new result version and notification | EssaySubmission, EssayUpload, ReviewAssignment, EssayEvaluation, Notification, Job/outbox, AttemptResult | Own submission status only; evaluator private notes never returned |
| 07.05.01-07.05.07 | `/attempts/:attemptId/results` | Student | `RESULTS` | Objective-scoring/manual-pending/final/unavailable; no final implication while essay pending; cached result shows version/freshness | Results: return full-precision objective `/75`, essay `/75`, raw combined `/150`, certificate `/75`, rounded certificate score, assigned level, result version, and submission scoring-policy version. Display section scores with 2 decimals; assign level only after certificate rounding to 1 decimal | AttemptResult with objectiveScore, essayScore, rawCombinedTotal, certificateScore, certificateScoreRounded, certificateLevel; AttemptItemResult, TopicResult, Attempt, EssayEvaluation | Own result; server calculation and version are authoritative |
| 07.06.01-07.06.09 | `/attempts/:attemptId/results`; explanation/report overlays have implementation-defined deep links | Student | `RESULTS`, explanation sheet, bookmark, report form | Item loading; missing explanation; corrected-in-new-version notice; report submission error preserves text | Results/Learning/Support: result item GET; bookmark POST/DELETE; question report. Published revisions are immutable; reports may produce a new revision/test version but never invalidate or recalculate submitted historical attempts | AttemptItemResult, QuestionRevision, AnswerKey server-side, QuestionReport, SavedQuestion | Own submitted/finalized attempt; correct answers only after allowed state |
| 07.07.01-07.07.11 | Result route; rubric/mistakes/recommendations as nested views | Student | `RESULTS`, rubric details, annotated feedback, dark/responsive/accessibility variants | Loading/empty feedback/error; long content; state shown with icon/label/color | Results/Essays: result GET and essay status/evaluation data; text similarity is non-authoritative and caveated | EssayEvaluation, EssayCriterion, EssayCriterionScore, TeacherFeedback, AIAnalysis, AttemptResult | Own published evaluation only; private notes/model internals excluded |

### Standalone essay-checking map

| Figma reuse / missing screen | UI route | Role | Components | Loading / empty / error / offline | Backend domain and requirements | Database entities | Auth and permission |
|---|---|---|---|---|---|---|---|
| Reuse 07.01 topic/method patterns; standalone topic catalogue/service selection screen is missing | `/esse-tekshirish` | Student | `M-SHELL`, `ESSAY-CHECK`, `TANGA`, published-topic selector, AI 2-Tanga and Teacher + AI 6-Tanga options, first-AI-free label | Topic/service loading; no published topics; archived-topic unavailable; selection error; first-free redeemed; insufficient Tanga | Standalone Essays/Access: topic lifecycle is `Draft -> Published -> Archived`; only published topics accept new submissions. List versioned published topics and quote server-authoritative cost/eligibility. The first-ever AI redemption is unique per account and never resets | EssayTopic, EssayTopicVersion with lifecycle status/timestamps, EssayServiceProduct/Price, FirstFreeServiceRedemption, TangaLedgerEntry | Authenticated student sees published topics only; authorized admin manages lifecycle; archival never deletes history |
| Reuse 07.02 typed editor and 07.03 upload components; standalone shell is missing | `/esse-tekshirish` submission state | Student | `ESSAY-CHECK`, `ESSAY`, `UPLOAD`, resubmission/charge confirmation | Empty/editing/local save/server save/offline/conflict; per-page upload; resubmission confirmation; insufficient Tanga | Every submission/resubmission is a new immutable attempt with its own payment/free-redemption decision. Editing an earlier submitted essay creates a new attempt. Freeze the exact topic version and text/upload version at submit; never overwrite prior attempts/results | EssayAttempt, EssaySubmissionVersion, EssayTextVersion, EssayUpload, MediaAsset, ServiceChargeReference, FirstFreeServiceRedemption | Own drafts/attempts only; server creates attempt and charge atomically; old submissions remain read-only |
| Reuse 07.04 processing/status and 07.07 rubric/mistake/recommendation components; standalone AI/teacher-capacity screens are missing | `/esse-tekshirish` evaluation state | Student | `ESSAY-CHECK`, `RESULTS`, `TANGA`, explicit AI label, teacher acceptance/cancellation/refund timeline | AI final within 15 minutes; teacher reserved/waiting acceptance/accepted/in review/ready; pre-acceptance cancelled/refunded; SLA missed/refunded-but-continuing; overall 24-hour target | Teacher policy uses `Asia/Tashkent`. Reservation deducts 6 Tanga. Acceptance records `acceptedAt` and starts a 15-minute SLA. Before acceptance, cancellation creates a full 6-Tanga compensating entry; after acceptance, cancellation is rejected. SLA miss creates a full 6-Tanga compensating entry but leaves the review active until completion. Teacher result binds to and replaces AI only for the exact submitted essay version | EssayEvaluation, TeacherReviewCapacityDay with policy timezone, TeacherReviewReservation/Assignment with acceptedAt/slaDeadline/status, EssaySubmissionVersion FK, TeacherFeedback, TangaLedgerEntry with original-entry link/refund reason | Own result; only assigned Sardor account accepts/reviews; server enforces cancellation boundary, SLA clock, refund idempotency, exact-version ownership |
| New standalone history screen is missing; reuse result/history list components | `/esse-tekshirish` history state | Student | `ESSAY-CHECK`, immutable attempt list, AI/teacher authority, paid/free/refund badges | Loading; empty; cached read; multiple attempts for same topic; archived-topic history | Return every immutable attempt separately, including topic/submission version, charge/free redemption, AI result, exact-version teacher review, replacement lineage, cancellation/SLA refund entries, and timestamps | EssayAttempt, EssaySubmissionVersion, EssayEvaluation lineage, TeacherReviewReservation/Assignment, TangaLedgerEntry | Own history only; no edit or resubmission mutates an earlier record |

## 6. Payments, profile, settings, and support map

| Figma frames | UI route | Role | Components | Loading / empty / error / offline | Backend domain and PDF API requirements | Database entities | Auth and permission |
|---|---|---|---|---|---|---|---|
| 08.01.01-08.01.06 | Standalone website `/packages`; Mini App may show wallet balance/service prices but no card-transfer purchase UI | Student | `COMMERCE`, `TANGA`, `M-SHELL` | Loading; no ledger history; insufficient Tanga; error; offline may show last known derived balance but blocks spending/top-up | Website exposes packages 7/21,000 so‘m, 15/40,000 so‘m, and 30/88,000 so‘m. Both surfaces may expose service costs and existing balance. Mini App payload/UI must omit cardholder data, transfer instructions, evidence upload, and card-transfer order creation | Product, ProductPrice, PaymentOrder, TangaLedgerEntry, surface/capability policy | Session required for personal balance/history; card-transfer top-up capability restricted to standalone website |
| 08.02.01-08.02.09 | Telegram Mini App wallet/service state; no card-transfer checkout route | Student | `TANGA`, balance, service-charge confirmation, website-open informational action where permitted | Balance loading; insufficient Tanga; service deduction; error; offline blocks mutation | Mini App may consume existing Tanga for approved services but cannot expose manual card-transfer purchasing. Do not serialize card number, transfer instructions, receipt-upload endpoint, or manual-payment creation capability to the Mini App | TangaLedgerEntry, Product/ServicePrice; no ManualPaymentEvidence creation from Mini App | Own balance; server enforces surface boundary and rejects Mini App manual-transfer order creation |
| 08.03.01-08.03.09 | Standalone website `/packages` and `/payments`; dedicated order/detail route is an implementation detail | Student | `COMMERCE`, `TANGA`, receipt image upload, payer full name, transfer date/time, manual-payment status | Creating; `Pending`, `Approved`, `Rejected`, `Cancelled`, `Reversed`; missing/invalid evidence; rejection reason; Pending-only cancellation; resubmit rejected as new request; offline unavailable | Website-only request requires receipt image, payer full name, and transfer date/time. Add Tanga only in the atomic administrator approval transaction. User cancellation transition is allowed only from Pending. Rejected request is immutable and may only be resubmitted with a new request ID | PaymentOrder, ManualPaymentEvidence/MediaAsset, PaymentStatusEvent, Product/Price snapshot, TangaLedgerEntry, AdminAuditLog | Own order/status; server rejects Mini App creation; student may cancel own Pending only and cannot approve/reverse |
| 08.04.01-08.04.07 | `/payments` | Student | `COMMERCE`, `TANGA`, complete request/status/ledger history, purchase-blocked state | Loading; empty; syncing; rejected with reason; cancelled; reversed; negative balance/purchases blocked; offline read only with timestamp | Return immutable request transitions and Tanga ledger. Reversal never deletes the original credit; it appends a compensating entry linked to the original. If derived balance is negative, deny purchases until restored to non-negative | PaymentOrder, PaymentStatusEvent, TangaLedgerEntry with compensatesEntryId, read-only TangaBalanceProjection/purchaseBlocked, ReversalRecord | Own history only; client cannot edit balance/history; purchase authorization checks non-negative balance |
| 08.05.01-08.05.08 | `/profile` | Student | `PROFILE`, `AUTH` | Loading; save/verification errors preserve fields; connected-account/session empty state; offline read only | Users/Auth: `GET /api/me`, profile PATCH, sessions GET/DELETE, link-identity POST; password-change endpoint is missing from PDF API catalogue | User, Profile, AuthIdentity, Credential, Session, Notification preference **TBD entity/setting** | Own account; sensitive changes may re-verify; session revoke scoped to own sessions |
| 08.06.01-08.06.03 | `/settings` | Student | `PROFILE` settings rows/switch/radio/theme | Loading/error; appearance can persist locally; server preference sync behavior offline **TBD** | Users/Notifications: profile/settings endpoints for preferences are not fully defined in PDF API catalogue | Profile, Notification, SystemSetting only where appropriate; personal preference entity **TBD** | Own preferences; critical security/payment messages cannot be fully disabled |
| 08.06.04 | **TBD saved-questions route**; Figma route map has no path | Student | `RESULTS`, `DISCOVERY` | Loading; empty; error; cached read possible | `GET /api/bookmarks`; delete bookmark endpoint | SavedQuestion **named by PDF narrative but absent from entity catalogue**, QuestionRevision | Own bookmarks; post-submission published content only |
| 08.06.05-08.06.07 | `/support` | Student | `PROFILE`, support form/status | Loading; no requests; error preserves message; offline submission queued behavior **not approved** | Support domain exists, but general support request/status endpoints and entity are missing from PDF catalogue; question reports are not a substitute | SupportRequest/SupportMessage **TBD**, PaymentOrder/Attempt/Essay reference where authorized | Own requests; minimize exposed payment/attempt context |
| 08.06.08-08.06.11 | `/settings` | Student | `PROFILE`, `A-SAFE-ACTION`-style destructive confirmation | Loading/error; offline prohibited for export/deletion; multi-step confirmation | Users/Privacy: export and delete/anonymize endpoints and retention workflow are not defined; logout uses `POST /api/auth/logout` | User, AccountRestriction/status, ExportJob, AdminAuditLog, retained payment/attempt records | Own account; re-verification; deletion follows approved retention policy, not immediate hard delete |
| 08.07.01-08.07.09 | Same underlying `/packages`, `/payments`, `/profile`, `/settings` routes | Student | Dark/responsive/accessibility/loading/error variants | Same state requirements; 360/390/430 behavior | Same APIs/entities as corresponding light screens | Same | Same |

## 7. Admin and teacher map

Admin tables always use server pagination/filter/sort, useful URL state, keyboard-accessible actions, and backend permission enforcement. Draft updates use optimistic concurrency. Published revisions/versions are read-only.

| Figma frames | UI route | Role/permission | Components and states | Backend domain and PDF API requirements | Database entities |
|---|---|---|---|---|---|
| 10.01.01-10.01.05 | `/admin` | ADMIN; role-scoped dashboards for REVIEWER/CONTENT_EDITOR and TEACHER | `A-SHELL`; cards/alerts; loading/error; empty dashboard behavior required; offline contract **TBD** | Admin aggregate APIs are not listed explicitly; may compose protected domain queries. Metrics define timezone/inclusion. No fabricated data | User, Attempt, AttemptResult, EssaySubmission/ReviewAssignment, QuestionReport, PaymentOrder, Job, AdminAuditLog |
| 10.02.01-10.02.06 | `/admin/questions`; detail `/admin/questions/:questionId`; reports route **TBD** | `question.view`; CONTENT_EDITOR/REVIEWER/ADMIN according to action | `A-SHELL`, `A-TABLE`, detail drawer; empty/restricted/loading/error | Admin Content APIs; question-report list/patch APIs; search/filter/server pagination; no hard delete of referenced content | Question, QuestionRevision, QuestionOption, AnswerKey, QuestionTopic/Tag, QuestionReview, QuestionReport, TestVersionItem |
| 10.03.01-10.03.04 | `/admin/questions/new` or `/admin/questions/:questionId` draft | `question.create`, `question.edit.draft` | `A-EDITOR`; type-specific form, protected key, structured rich text, validation, autosave/unsaved warning/error preservation | POST question; PATCH draft; revision/stimulus APIs. Validate type, keys, points, explanation, media, rubric, mobile preview. No raw HTML | Subject, Topic/Subtopic, Tag, MediaAsset, Stimulus/Revision, Question/Revision/Option, AnswerKey, QuestionTopic/Tag |
| 10.03.05-10.03.10 | `/admin/questions/:questionId`; revision comparison `/admin/questions/:questionId/revisions/:revisionId` | Reviewer/ADMIN; approval permission distinct; optional no self-approval | `A-EDITOR`, `A-SAFE-ACTION`; preview, review, changes requested, published read-only, comparison, conflict/error states | submit-review, approve, request-changes, reject, archive, usage APIs; new revision for published content; answer-key change warning; audit | Question, QuestionRevision, QuestionReview, AnswerKey, StimulusRevision, TestVersionItem, AdminAuditLog |
| 10.04.01 | `/admin/tests` | Test view/edit permissions; CONTENT_EDITOR/REVIEWER/ADMIN | `A-TABLE`; loading/empty/error/restricted | Admin tests GET/POST; version/lifecycle filters and usage | Test, TestVersion, TestAccessRule, TestAssignment |
| 10.04.02-10.04.10 | `/admin/tests/new` and `/admin/tests/:testId` | `test.create/edit/validate/review/publish`; publish separately restricted | `A-EDITOR`, builder, scoring validation, review, publish confirmation, published read-only; conflict/error states | Validate exactly 45 items, Q1-44 frozen raw weights totaling 76, Q40-44 independent sub-answers, normalization to objective `/75`, Q45 rubric raw `/24` with exact matrix to essay `/75`, raw combined `/150`, certificate `/75`, and level thresholds. Atomic publish freezes revisions and the entire scoring policy. Published tests are immutable; corrections create a new question revision and test version; no post-submission invalidation | Test, TestVersion, TestSection, TestVersionItem, TestAccessRule, QuestionRevision, StimulusRevision, ScoringPolicyVersion, ObjectiveWeightRule, EssayRubricVersion, EssayLookupMatrixVersion/Row, AdminAuditLog |
| 10.05.01-10.05.02 | `/admin/essays`; assignment drawer on same route; deep link **TBD** | ADMIN/coordinator `essay.assign`; Sardor Toshmuhammadov as the only launch TEACHER | `A-TABLE`, `A-REVIEW`; FIFO, `Asia/Tashkent` capacity date, waiting acceptance, accepted 15-minute countdown, SLA-missed/refunded state | Reserve at most 15 slots per Tashkent day and assign FIFO to Sardor. Reservation precedes 6-Tanga deduction. Teacher acceptance starts the 15-minute SLA. Pre-acceptance cancellation refunds; post-acceptance cancellation is unavailable; SLA miss refunds but does not remove work from queue | EssaySubmissionVersion, TeacherReviewCapacityDay with timezone/localDate, TeacherReviewReservation/Assignment with acceptedAt/slaDeadline/status, TangaLedgerEntry, User/Profile limited context |
| 10.05.03-10.05.09 | `/admin/essays/:essayId` (Figma) corresponding to PDF `:submissionId` | TEACHER for assigned work; ADMIN for assignment/second review; `essay.evaluate/finalize` | `A-REVIEW`, file viewer, rubric, annotation, replacement request, validation, completion, conflict; autosave/error preservation; offline behavior **TBD** | evaluation-draft PUT, finalize, second-review; request-new-upload endpoint is missing. Teacher total calculated server-side; completion audited and creates result version | EssaySubmission, EssayUpload, EssayTextVersion, ReviewAssignment, EssayEvaluation, EssayCriterion/Score, TeacherFeedback, AIAnalysis, AttemptResult, AdminAuditLog |
| 10.06.01-10.06.03 | `/admin/students`; `/admin/students/:studentId` | ADMIN; SUPPORT may have explicit limited read-only permission | `A-TABLE`, detail tabs; loading/empty/error/restricted | admin users GET/detail; admin attempts GET/detail; sensitive actions require reason/audit | User, Profile, AuthIdentity limited, Session, AccountRestriction, Attempt, AttemptResult, EssaySubmission, PaymentOrder, Entitlement, CreditLedger |
| 10.06.04-10.06.06 | `/admin/payments`; `/admin/payments/:orderId` | FINANCE_ADMIN/authorized ADMIN; support read-only only if explicitly granted | `A-TABLE`, receipt image, payer name, transfer timestamp, complete status timeline; approve/reject/reverse confirmations | Review only complete Pending evidence. Approval atomically credits Tanga and records actor/time. Rejection requires reason. Reversal requires authorized administrator and reason, appends a compensating ledger entry, preserves all history, and may place account in negative-balance purchase-blocked state | PaymentOrder, ManualPaymentEvidence/MediaAsset, PaymentStatusEvent, Product/Price snapshot, TangaLedgerEntry with compensation link, ReversalRecord, TangaBalanceProjection, AdminAuditLog |
| 10.06.07-10.06.08 | `/admin/students/:studentId`; separate entitlement path **TBD** | ADMIN with `entitlement.adjust`; FINANCE_ADMIN only if explicitly granted | `A-SAFE-ACTION`, ledger/history table; loading/empty/error/conflict | admin user entitlement and credit-adjustment APIs; atomic ledger entry, reason, reference, idempotency, no editable numeric balance | Entitlement, CreditAccount, CreditLedger, PaymentOrder, AdminAuditLog |
| 10.06.09 | `/admin/students/:studentId` confirmation state | ADMIN `student.restrict` | `A-SAFE-ACTION`; impact, reason, active-attempt policy, error rollback | POST user restriction; DELETE to remove; do not delete history; exact active-attempt handling is a missing policy | User, AccountRestriction, Attempt, Session, AdminAuditLog |
| 10.07.01-10.07.03 | `/admin/staff`; staff-detail route **TBD** | SUPER_ADMIN or narrowly granted staff-management permission | `A-TABLE`, permission matrix, role-change confirmation; loading/empty/error | Staff/role APIs are missing from PDF catalogue. Role changes revoke/rotate relevant sessions, require reason, and audit | User, UserRole, Role, Permission/RolePermission if introduced, Session, AdminAuditLog |
| 10.07.04 | `/admin/settings` | ADMIN for safe settings; SUPER_ADMIN for security settings | `A-EDITOR`, `A-SAFE-ACTION`; loading/error/version conflict; no offline mutation | Settings APIs missing. Version safe operational settings; never store secrets, bot tokens, DB credentials | SystemSetting, FeatureFlag, AdminAuditLog |
| 10.07.05 | `/admin/audit` | ADMIN/SUPER_ADMIN with `audit.view`; append-only for normal admins | `A-TABLE`; loading/empty/error/restricted | `GET /api/admin/audit`; server filtering/pagination; redact sensitive values | AdminAuditLog |
| 10.07.06 | Current protected admin route | Any denied actor | Permission-restricted state, safe back/contact action | Every protected endpoint returns safe `PERMISSION_DENIED` and audits where appropriate | UserRole/Permission, AdminAuditLog |
| 10.07.07-10.07.13 | Same corresponding question/essay/admin routes | Same as source screen | Dark, tablet, long-content, accessibility, loading/empty/error variants; table internal scroll only; admin offline behavior remains **TBD** | Same APIs and permission checks as source screen | Same as source screen |

## 8. Backend domain and entity ownership summary

| Domain | Owns or coordinates | Primary entities |
|---|---|---|
| Auth | Telegram validation, credentials, sessions, linking, MFA/revocation | User, AuthIdentity, Credential, Session, UserRole, AccountRestriction |
| Users | Profile, preferences, personal sessions, privacy workflows | Profile, Session, Notification/preferences TBD, ExportJob |
| Content / Question Bank | Taxonomy, stimuli, revisions, keys, review, reports | Subject, Topic, Subtopic, Tag, MediaAsset, Stimulus/Revision, Question/Revision/Option, AnswerKey, QuestionReview/Report |
| Onboarding / Roadmaps | Exact onboarding/diagnostic versions; two roadmap modes and three views; dependency graph and baseline-improvement branches; status/progression policy; ungated required activity; pacing and weekly planning; source-triggered recalculation; immutable roadmap/progress versions | OnboardingSession, OnboardingOptionSetVersion, OnboardingResponse/Answer, DiagnosticBlueprint/Version/VersionTopic/VersionItem, DiagnosticAttempt/Answer/Result/TopicResult, Roadmap/Version/Mode/Node/Edge, RoadmapNodeStatus/History, RoadmapBaselineSnapshot, RoadmapTopicPriority, WeeklyPlan/Version/Item, RoadmapProgressEvent, PacingProfile, TopicPracticeResult, EssayEvaluation, AttemptResult |
| Topic Practice | Extensible topic modules; fixed standard/readings/g‘azal count and duration rules; version-scoped free/paid limits; equal-value percentage score; best-result band; autosave, explanations, retry, separate analytics | TopicPracticeModule, TopicQuiz/Version/VersionItem, TopicPracticeAttempt, TopicPracticeAnswer/Version, TopicPracticeResult; shared attempt storage is allowed only with an explicit non-mock type |
| Test Builder | Drafts, immutable published versions, sections, access policy | Test, TestVersion, TestSection, TestVersionItem, TestAccessRule, TestAssignment |
| Attempts | Start/resume, frozen delivery, timer, answer revisions, flags, submit/expire | Attempt, AttemptItem, AttemptAnswer/Version, AttemptQuestionFlag, AttemptEvent |
| Scoring / Results | Q1-44 raw `/76` weights and normalization to objective `/75`; essay raw `/24` fixed matrix to `/75`; raw combined `/150`; certificate `(objective+essay)/2` `/75`; full precision, display precision, rounded level assignment; immutable historical versions | ScoringPolicyVersion, ObjectiveWeightRule/SubAnswerRule, Attempt, AttemptResult, AttemptItemResult, TopicResult |
| Essays | Topic lifecycle Draft/Published/Archived; immutable separately billed submissions/resubmissions; exact submission-version teacher binding. An AI-only result is the final platform result when teacher review is not purchased. When Teacher + AI review is purchased, the completed teacher result replaces the student-visible AI result for that exact essay submission version. `Asia/Tashkent` capacity; acceptance-started 15-minute SLA; cancellation/SLA compensating refunds | EssayTopic/Version, EssayAttempt, EssaySubmissionVersion, EssayTextVersion, EssayUpload, EssayRubricVersion, EssayCriterion/Score, StructureRuleVersion, EssayLookupMatrixVersion/Row, EssayEvaluation, AIAnalysis, TeacherReviewCapacityDay, TeacherReviewReservation/Assignment, TeacherFeedback |
| Tanga / Payments | Five-state manual requests with required evidence; approval-only credit; Pending-only user cancellation; reasoned rejection/reversal; immutable ledger/compensation; negative-balance purchase block; website-only card transfer | Product/Price, PaymentOrder, ManualPaymentEvidence, PaymentStatusEvent, FirstFreeServiceRedemption, TangaLedgerEntry with compensation link, TangaBalanceProjection/purchaseBlocked, ReversalRecord, SurfaceCapabilityPolicy |
| Notifications / Support | Bot/in-app delivery, question and technical reports | Notification, QuestionReport, general SupportRequest TBD |
| Administration / Audit | Safe settings, jobs/imports/exports, immutable audit | AdminAuditLog, SystemSetting, FeatureFlag, ImportBatch, ExportJob, Job |

Atomic operations include practice-attempt start plus optional 1-Tanga deduction; mock start plus 2-Tanga deduction; essay attempt creation plus free redemption or charge; teacher-slot reservation plus 6-Tanga deduction; pre-acceptance/SLA refund plus compensating entry; manual-payment approval plus package credit; administrator reversal plus compensation/purchase-block update; final submission plus answer freeze; scoring; teacher finalization for the exact submission version; and test-version publication. Every operation is idempotent. Historical records are never overwritten, ledger history is never deleted, and no operation directly edits a numeric Tanga balance.

## 9. Complete approved Figma frame index

Each frame below is mapped by the range/table entry in sections 3-7. The viewport is 390 x 844 unless otherwise stated.

### Page 05 - Student High Fidelity (37)

- `05.01.01` Telegram Launch
- `05.01.02` First-Time Profile Setup
- `05.01.03` Browser Login
- `05.01.04` Browser Registration
- `05.01.05` Authentication Error
- `05.02.01` Dashboard With Active Attempt
- `05.02.02` Dashboard Without Active Attempt
- `05.02.03` New Student Dashboard
- `05.02.04` Notifications Preview
- `05.03.01` All Tests
- `05.03.02` Search Results
- `05.03.03` Active Tests Filter
- `05.03.04` Completed Tests Filter
- `05.03.05` Catalogue Empty State
- `05.04.01` Topic Catalogue
- `05.04.02` Topic Details
- `05.04.03` Recommended Practice
- `05.04.04` Completed Topic
- `05.05.01` Free Test Details
- `05.05.02` Premium Test Details
- `05.05.03` Active Attempt Details
- `05.05.04` Completed Test Details
- `05.05.05` Exam Instructions Disabled
- `05.05.06` Exam Instructions Enabled
- `05.06.01` Resume Attempt Dialog
- `05.06.02` Start New Attempt Confirmation
- `05.06.03` Premium Access Required
- `05.06.04` Filter and Sort Sheet
- `05.06.05` General Loading
- `05.06.06` General Error
- `05.06.07` Offline Launch
- `05.06.08` Session Expired
- `05.07.01` Dark Dashboard
- `05.07.02` Dark Test Catalogue
- `05.07.03` Small Mobile Dashboard - 360 x 800
- `05.07.04` Large Mobile Catalogue - 430 x 932
- `05.07.05` Long-Text Stress Test

### Page 06 - Exam Engine (48)

- `06.01.01` Exam Loading
- `06.01.02` Standard Exam Shell
- `06.01.03` Exam Shell With Long Content
- `06.01.04` Timer Warning State
- `06.01.05` Final Minute State
- `06.02.01` Single Choice Default
- `06.02.02` Single Choice Selected
- `06.02.03` Multiple Choice
- `06.02.04` True or False
- `06.02.05` Image-Based Question
- `06.02.06` Formula and Special Symbols
- `06.03.01` Reading Group Question
- `06.03.02` Reading Passage Full Screen
- `06.03.03` Reading Passage With Question Split View
- `06.03.04` G‘azal Group Question
- `06.03.05` Full G‘azal Overlay
- `06.03.06` Literary Excerpt Question
- `06.04.01` Short Text Answer
- `06.04.02` Correction Answer
- `06.04.03` Matching Question
- `06.04.04` Matching Selection Sheet
- `06.04.05` Ordering Question
- `06.04.06` Fill in the Blank
- `06.04.07` Long Written Answer
- `06.05.01` Question Navigator Sheet
- `06.05.02` Bookmark State
- `06.05.03` Saving
- `06.05.04` Saved
- `06.05.05` Offline
- `06.05.06` Retrying
- `06.05.07` Save Error
- `06.05.08` Reopened Attempt
- `06.06.01` Final Review
- `06.06.02` Review With Missing Essay
- `06.06.03` Submit Confirmation
- `06.06.04` Submitting
- `06.06.05` Submitted Successfully
- `06.06.06` Time Expired
- `06.06.07` Submission Error
- `06.06.08` Duplicate Submission Protection
- `06.07.01` Dark Single-Choice Question
- `06.07.02` Dark Reading Question
- `06.07.03` Dark Question Navigator
- `06.07.04` Small Mobile Question - 360 x 800
- `06.07.05` Large Mobile Reading - 430 x 932
- `06.07.06` Keyboard Open State
- `06.07.07` Long Uzbek Stress Test
- `06.07.08` Accessibility State Comparison

### Page 07 - Essay and Results (56)

- `07.01.01` Essay Question Introduction
- `07.01.02` Submission Method
- `07.01.03` Method Confirmation
- `07.01.04` Existing Essay Draft
- `07.02.01` Typed Essay Empty
- `07.02.02` Typed Essay In Progress
- `07.02.03` Essay Below Minimum
- `07.02.04` Essay Above Maximum
- `07.02.05` Typed Essay Offline
- `07.02.06` Restoring Draft
- `07.02.07` Essay Review Before Submission
- `07.02.08` Typed Essay Submit Confirmation
- `07.03.01` Upload Empty
- `07.03.02` Camera Guidance
- `07.03.03` One Page Uploading
- `07.03.04` Three Pages Ready
- `07.03.05` Reordering Pages
- `07.03.06` Blurry Image Warning
- `07.03.07` Upload Failure
- `07.03.08` Handwritten Review
- `07.03.09` Handwritten Submit Confirmation
- `07.04.01` Essay Submitting
- `07.04.02` Image Processing
- `07.04.03` Processing Completed
- `07.04.04` Teacher Review Pending
- `07.04.05` Under Review
- `07.04.06` Revision Requested
- `07.04.07` Review Completed
- `07.04.08` Review Processing Error
- `07.05.01` Preliminary Objective Result
- `07.05.02` Final Result Overview
- `07.05.03` Topic Analysis
- `07.05.04` Strengths and Recommendations
- `07.05.05` Attempt Comparison
- `07.05.06` Attempt History
- `07.05.07` Result Report
- `07.06.01` Question Result List
- `07.06.02` Correct Answer Explanation
- `07.06.03` Incorrect Answer Explanation
- `07.06.04` Written Answer Review
- `07.06.05` Invalidated Question
- `07.06.06` Explanation Missing
- `07.06.07` Save Question
- `07.06.08` Report Problem
- `07.06.09` Report Submitted
- `07.07.01` Essay Evaluation Overview
- `07.07.02` Rubric Detail
- `07.07.03` Essay Mistakes
- `07.07.04` Improvement Recommendations
- `07.07.05` Text Similarity Notice
- `07.07.06` Dark Final Result
- `07.07.07` Dark Essay Evaluation
- `07.07.08` Small Mobile Essay - 360 x 800
- `07.07.09` Large Mobile Result - 430 x 932
- `07.07.10` Long Feedback Stress Test
- `07.07.11` Accessibility State Comparison

### Page 08 - Payments and Profile (59)

- `08.01.01` Package Catalogue
- `08.01.02` Package Comparison
- `08.01.03` Package Details
- `08.01.04` Current Package
- `08.01.05` Package Nearly Finished
- `08.01.06` No Active Package
- `08.02.01` Stars Order Summary
- `08.02.02` Telegram Invoice Opening
- `08.02.03` Payment Awaiting Confirmation
- `08.02.04` Payment Processing
- `08.02.05` Payment Success
- `08.02.06` Paid but Activation Pending
- `08.02.07` Payment Cancelled
- `08.02.08` Payment Failed
- `08.02.09` Duplicate Payment Protection
- `08.03.01` Browser Package Pricing
- `08.03.02` Browser Checkout
- `08.03.03` Redirecting to Payment Provider
- `08.03.04` Browser Payment Pending
- `08.03.05` Browser Payment Success
- `08.03.06` Browser Payment Failed
- `08.03.07` Restore Access
- `08.03.08` Access Restored
- `08.03.09` Restore Not Found
- `08.04.01` Payment History
- `08.04.02` Empty Payment History
- `08.04.03` Payment Receipt
- `08.04.04` Entitlement Usage History
- `08.04.05` Entitlement Syncing
- `08.04.06` Entitlement Sync Error
- `08.04.07` Refund or Reversal Status
- `08.05.01` Profile Overview
- `08.05.02` Edit Personal Information
- `08.05.03` Profile Saved
- `08.05.04` Phone Verification
- `08.05.05` Connected Accounts
- `08.05.06` Account Security
- `08.05.07` Change Password
- `08.05.08` Active Sessions
- `08.06.01` Notification Settings
- `08.06.02` Appearance Settings
- `08.06.03` Language Settings
- `08.06.04` Saved Questions Entry
- `08.06.05` Help Centre
- `08.06.06` Support Request
- `08.06.07` Support Submitted
- `08.06.08` Privacy and Data
- `08.06.09` Logout Confirmation
- `08.06.10` Delete Account Information
- `08.06.11` Final Delete Confirmation
- `08.07.01` Dark Package Catalogue
- `08.07.02` Dark Payment Success
- `08.07.03` Dark Profile
- `08.07.04` Small Mobile Checkout - 360 x 800
- `08.07.05` Large Mobile Profile - 430 x 932
- `08.07.06` Long Package Content Stress Test
- `08.07.07` Payment State Accessibility
- `08.07.08` Loading and Skeleton States
- `08.07.09` General Account Error

### Page 10 - Admin High Fidelity (62)

- `10.01.01` Administrator Dashboard
- `10.01.02` Content Reviewer Dashboard
- `10.01.03` Essay Evaluator Dashboard
- `10.01.04` Dashboard Loading
- `10.01.05` Dashboard Error
- `10.02.01` Question Library
- `10.02.02` Question Detail Drawer
- `10.02.03` Question Reports
- `10.02.04` Question Report Detail
- `10.02.05` Empty Question Library
- `10.02.06` Restricted Question Access
- `10.03.01` Create Single-Choice Question
- `10.03.02` Create Matching Question
- `10.03.03` Create Passage Group
- `10.03.04` Create G‘azal Group
- `10.03.05` Question Preview
- `10.03.06` Submit for Review
- `10.03.07` Reviewer Workspace
- `10.03.08` Changes Requested
- `10.03.09` Published Question
- `10.03.10` Revision Comparison
- `10.04.01` Test Library
- `10.04.02` Create Test Basics
- `10.04.03` Test Builder - 1600 x 1100
- `10.04.04` Add Question Drawer
- `10.04.05` Revision Warning
- `10.04.06` Test Validation
- `10.04.07` Test Review Workspace
- `10.04.08` Publish Configuration
- `10.04.09` Publish Confirmation
- `10.04.10` Published Test
- `10.05.01` Essay Queue
- `10.05.02` Essay Assignment Drawer
- `10.05.03` Typed Essay Review - 1600 x 1100
- `10.05.04` Handwritten Essay Review - 1600 x 1100
- `10.05.05` Essay Issue Annotation
- `10.05.06` Request New Upload
- `10.05.07` Essay Completion Validation
- `10.05.08` Essay Completed
- `10.05.09` Essay Review Conflict
- `10.06.01` Student Library
- `10.06.02` Student Detail
- `10.06.03` Student Attempts
- `10.06.04` Payment Library
- `10.06.05` Payment Detail
- `10.06.06` Paid but Activation Pending
- `10.06.07` Manual Entitlement Adjustment
- `10.06.08` Entitlement History
- `10.06.09` Student Block Confirmation
- `10.07.01` Staff Management
- `10.07.02` Staff Detail and Permissions
- `10.07.03` Change Role Confirmation
- `10.07.04` System Settings
- `10.07.05` Audit Log
- `10.07.06` Global Permission Restricted
- `10.07.07` Dark Question Library
- `10.07.08` Dark Essay Review - 1600 x 1100
- `10.07.09` Tablet Question Library - 1024 x 768
- `10.07.10` Tablet Essay Queue - 1024 x 768
- `10.07.11` Long Content Stress Test
- `10.07.12` Accessibility State Comparison
- `10.07.13` Loading, Empty and Error States

## 10. New standalone screens missing from Figma

Approved components can be reused, but the following complete screens are not present as standalone high-fidelity frames:

### Topic practice

1. Topic-practice catalogue populated with the eight confirmed modules and module-level progress.
2. Topic-practice quiz summary/start screen showing fixed question count, duration, access type, cost, version-scoped attempts remaining, and best-result progress band.
3. `/mashqlar/:quizId` standalone runner shell that is visually distinct from a full mock.
4. Ilmiy matn practice screen with one complete passage and its five-question sequence.
5. Badiiy matn practice screen with one complete passage and its five-question sequence.
6. G‘azal practice screen with the complete g‘azal and its five-question sequence.
7. Topic-practice completion screen combining `/100%` score, explanations, best result, `Needs improvement`/`Good`/`Mastered` update, and retry eligibility.
8. Attempt-limit reached and insufficient-Tanga/start-charge states.
9. Admin topic/module authoring and immutable quiz-version publishing, including adding later topic modules and linked complete stimulus content.

### Standalone essay checking

1. Standalone essay-topic and service selection showing AI 2 Tanga, Teacher + AI 6 Tanga, and the first-account AI check free state.
2. `/esse-tekshirish` standalone submission shell outside an Attempt.
3. Standalone AI evaluation queued/processing/failure/late states with an explicit AI-assessment label and 15-minute expectation.
4. Standalone official 12-criterion evaluation using the Sardor structure-rule additions and fixed `24 -> 75` matrix.
5. Standalone previous essay-checking history with multiple immutable attempts for one topic, exact submission versions, charges/free entitlement, authoritative teacher result, and preserved AI assessment.
6. Teacher-slot reservation, 6-Tanga deduction, waiting acceptance, accepted 15-minute SLA, pre-acceptance cancellation/refund, post-acceptance cancellation-disabled, SLA-missed/refunded-but-continuing, ready timeline, and overall 24-hour expectation.
7. Daily-capacity-full screen with `Bugungi o‘rinlar tugadi` and the next available date.
8. Teacher result replacement state that makes the human result authoritative without erasing the AI audit record.

### Tanga and manual card payment

1. Standalone-website Tanga package catalogue for 7/15/30 Tanga and the frozen so‘m prices.
2. Tanga transaction history and derived-balance presentation.
3. Standalone-website manual payment form requiring receipt image, payer full name, and transfer date/time, with `Pending`, `Approved`, `Rejected`, `Cancelled`, and `Reversed` states.
4. Admin evidence review, reason-required rejection, approval credit, and reason-required reversal confirmation.
5. Reusable Pending-only cancellation, rejected-as-new-request resubmission, compensating reversal, negative-balance, and purchases-blocked states.
6. Telegram Mini App wallet/service state that shows usable Tanga but contains no card-transfer purchase, card details, transfer instructions, or receipt upload.

### Diagnostic and roadmap

The onboarding flow and all six primary roadmap views are present as approved high-fidelity Figma screens. The complete roadmap Figma redesign is completed and approved.

Remaining implementation gaps:

1. `/diagnostika` free 15-question diagnostic intro, runner, completion, and result states with the frozen `1/1/1/2/2/2/3/3` distribution.
2. Frontend implementation of the six approved roadmap screens, their responsive behavior, state handling, and route/query synchronization.
3. Backend graph generation, baseline comparison, pacing, weekly scheduling, unlock/status calculation, and recalculation triggers.
4. Persistent roadmap data, immutable roadmap/version lineage, weekly-plan versions, and prior progress history.
5. Authentication, ownership enforcement, and API integration for roadmap reads, actions, generation, and recalculation.
6. Admin diagnostic-topic authoring and immutable version publishing.

The earlier `Roadmap — Approved Flow` / `Preliminary Roadmap — First-Time` Figma concept (`292:1980`, `292:1981`) is superseded and not approved for implementation because it presents a preliminary summary and seven-day plan without the complete connected roadmap.

Existing Page 06 exam/stimulus/autosave components and Page 07 essay/upload/results/evaluation components should be reused; their full-mock route chrome and old contextual copy must not be carried into the standalone experiences.

## 11. Frozen corrections and remaining genuine blockers

Resolved and removed from blocker status:

- final score calculation, precision, display rounding, certificate rounding, and grade thresholds;
- exact Q1-Q44 raw weights, `/76 -> /75` normalization, and Q40-Q44 independent sub-answer scoring;
- reviewed/published immutability and no post-submission invalidation;
- the 12 essay criteria, allowed increments, raw `/24`, and complete fixed `/24 -> /75` lookup matrix. An AI-only result is the final platform result when teacher review is not purchased. When Teacher + AI review is purchased, the completed teacher result replaces the student-visible AI result for that exact essay submission version;
- `/onboarding`, `/diagnostika`, and `/yol-xaritasi`, including exact onboarding options and diagnostic topic distribution;
- website-only manual card-transfer top-up boundary;
- equal-value diagnostic scoring, readiness bands, weakness priority, three-topic roadmap start, and 20-question topic-quiz estimate replacement;
- essay-topic `Draft -> Published -> Archived`, immutable separately billed resubmissions, and exact submission-version teacher binding;
- `Asia/Tashkent` teacher policy, acceptance-started 15-minute SLA, pre-acceptance cancellation refund, and SLA-miss refund with continued review;
- required manual-payment evidence, five statuses, approval-only credit, reasoned rejection/reversal, immutable compensation, and negative-balance purchase blocking.

No unresolved product-decision blockers remain.

## 12. Recommended first development milestone

**Milestone 1: one complete, secure, reproducible free mock test from authentication through the preliminary objective result, operated through a versioned admin workflow.**

Included vertical slice:

1. Engineering foundation: one Next.js modular monolith, PostgreSQL migrations, environment validation, secure sessions/RBAC, logging/error envelope, CI, staging, backups.
2. Telegram authentication plus browser fallback and a minimal student profile.
3. Admin taxonomy, stimulus, single-choice question draft/revision/review, protected answer key, explanation, and immutable test-version publication.
4. Student catalogue, free-test detail/access decision, atomic attempt start, frozen delivery, server timer, single-choice plus reading/g‘azal group UI.
5. Durable IndexedDB answer queue, server revisions, navigator/flags, resume, review, idempotent submit, expiration worker.
6. Deterministic Q1-Q44 raw scoring out of 76 and normalization to objective `/75`, versioned preliminary result, item explanations, bookmark, question report, and attempt history. The UI reserves essay `/75`, raw combined `/150`, and certificate `/75`, and must not label the certificate result final until question 45 is evaluated.
7. Security tests for forged Telegram data, cross-user IDs, answer-key leakage, stale revisions, duplicate starts/submissions, and admin permission bypass.

Exit criteria:

- One reviewed free mock is reproducibly published as an immutable `TestVersion`.
- Reopen and weak-network tests preserve answers; server time remains authoritative.
- Duplicate starts/saves/submissions do not duplicate state or access consumption.
- Active-exam payloads expose no protected answer data.
- The same frozen revisions and submission scoring-policy version deterministically reproduce the stored result.
- Student and administrator can complete the full journey without manual database edits.

Typed question-45 essay submission and its versioned AI evaluation follow after the objective engine and complete the final objective `/75`, essay `/75`, raw combined `/150`, and certificate `/75` result. Optional purchased teacher review then replaces the AI essay result. Manual card-transfer top-up remains exclusive to the standalone website; the Telegram Mini App may use an existing Tanga balance but exposes no card-transfer purchase flow.
