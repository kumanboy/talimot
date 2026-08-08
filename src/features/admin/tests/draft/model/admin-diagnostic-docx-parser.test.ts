import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parseDiagnosticDocxDocument,
} from "./admin-diagnostic-docx-parser";

describe(
    "admin diagnostic DOCX parser",
    () => {
        it(
            "counts nested passage questions and keeps 100 as normalized maximum",
            () => {
                const result =
                    parseDiagnosticDocxDocument(`
TEST TURI: DIAGNOSTIKA
SARLAVHA: Diagnostika — 2
TAVSIF: To‘liq diagnostika
KO‘RSATMA: Savollarga javob bering.
DAQIQA: 180
KIRISH: BEPUL
QIYINLIK: HARD
TOPSHIRIQLAR: 7
MAKSIMAL BALL: 100

SAVOL 1
TUR: MULTIPLE-CHOICE
SAVOL: To‘g‘ri javobni tanlang.
BALL: 1.7
A) Bir
B) Ikki
C) Uch
D) To‘rt
JAVOB: A

SAVOL 18 — 18–22-savollar
TUR: PASSAGE-GROUP
BO‘LIM: SCIENTIFIC-TEXT
SARLAVHA: Ilmiy matn
KO‘RSATMA: Matnni o‘qing.
MATN:
1. Birinchi paragraf.
2. Ikkinchi paragraf.
ICHKI SAVOLLAR:
18. SAVOL: Birinchi savol
A) A
B) B
C) C
D) D
JAVOB: A
BALL: 1.1
19. SAVOL: Ikkinchi savol
A) A
B) B
C) C
D) D
JAVOB: B
BALL: 1.1
20. SAVOL: Uchinchi savol
A) A
B) B
C) C
D) D
JAVOB: C
BALL: 1.1
21. SAVOL: To‘rtinchi savol
A) A
B) B
C) C
D) D
JAVOB: D
BALL: 1.1
22. SAVOL: Beshinchi savol
A) A
B) B
C) C
D) D
JAVOB: A
BALL: 1.1

SAVOL 45
TUR: ESSAY
SARLAVHA: ESSE
PROMPT: Vaziyat yuzasidan munosabatingizni yozing.
VAZIYAT: Raqamli ta’limni muhokama qiling.
MINIMAL SO‘Z: 200
TAVSIYA ETILGAN SO‘Z: 250
BALL: 24
`);

                expect(
                    result,
                ).not.toBeNull();

                expect(
                    result?.taskCount,
                ).toBe(
                    7,
                );

                expect(
                    result?.maximumScore,
                ).toBe(
                    100,
                );

                expect(
                    result?.rawMaximumScore,
                ).toBe(
                    31.2,
                );

                expect(
                    result?.issues,
                ).toEqual(
                    [],
                );

                const passage =
                    result?.questions.find(
                        (question) =>
                            question.type ===
                            "passage-group",
                    );

                expect(
                    passage?.type ===
                        "passage-group"
                        ? passage.questions.length
                        : 0,
                ).toBe(
                    5,
                );
            },
        );

        it(
            "counts a 33–35 matching group as three answerable tasks",
            () => {
                const result =
                    parseDiagnosticDocxDocument(`
TEST TURI: DIAGNOSTIKA
SARLAVHA: Diagnostika matching
TAVSIF: Matching group test
KO‘RSATMA: Savollarga javob bering.
DAQIQA: 180
KIRISH: BEPUL
QIYINLIK: HARD
TOPSHIRIQLAR: 5
MAKSIMAL BALL: 100

SAVOL 1
TUR: MULTIPLE-CHOICE
SAVOL: To‘g‘ri javobni tanlang.
BALL: 1.7
A) Bir
B) Ikki
C) Uch
D) To‘rt
JAVOB: A

SAVOL 33 — 33–35-savollar
TUR: MATCHING-GROUP
BO‘LIM: SINTAKSIS
SARLAVHA: Moslashtirish
KO‘RSATMA: Moslang.
SAVOL: Gaplarni moslashtiring.
VARIANTLAR:
A) A izoh
B) B izoh
C) C izoh
D) D izoh
E) E izoh
F) F izoh
MOSLASHTIRISH:
33. Birinchi prompt | JAVOB: A | BALL: 1.7
34. Ikkinchi prompt | JAVOB: C | BALL: 1.7
35. Uchinchi prompt | JAVOB: F | BALL: 1.7

SAVOL 45
TUR: ESSAY
SARLAVHA: ESSE
PROMPT: Vaziyat yuzasidan munosabatingizni yozing.
VAZIYAT: Raqamli ta’limni muhokama qiling.
MINIMAL SO‘Z: 200
TAVSIYA ETILGAN SO‘Z: 250
BALL: 24
`);

                expect(
                    result,
                ).not.toBeNull();

                expect(
                    result?.taskCount,
                ).toBe(
                    5,
                );

                const matching =
                    result?.questions.find(
                        (question) =>
                            question.type ===
                            "matching",
                    );

                expect(
                    matching?.type ===
                        "matching"
                        ? matching.items.map(
                            (item) =>
                                item.sourceOrder,
                        )
                        : [],
                ).toEqual(
                    [
                        33,
                        34,
                        35,
                    ],
                );

                expect(
                    result?.issues,
                ).toEqual(
                    [],
                );
            },
        );

        it(
            "returns null for non-diagnostic documents",
            () => {
                expect(
                    parseDiagnosticDocxDocument(
                        "TEST TURI: ARALASH",
                    ),
                ).toBeNull();
            },
        );
    },
);
