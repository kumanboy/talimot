import {
    describe,
    expect,
    it,
} from "vitest";

import {
    createAdminDiagnosticDraftImport,
    createAdminDiagnosticQuestionImport,
} from "./admin-diagnostic-draft-import";
import {
    parseDiagnosticDocxDocument,
} from "./admin-diagnostic-docx-parser";
import {
    calculateAdminDraftMaximumScore,
    calculateAdminDraftTaskCount,
    validateAdminTestDraft,
} from "./admin-test-draft-validation";

import type {
    AdminTestDraft,
} from "./admin-test-draft-types";

function mcq(
    order:
        number,
): string {
    return `
SAVOL ${order}
TUR: MULTIPLE-CHOICE
SAVOL: ${order}-savol
BALL: 1
A) A javob
B) B javob
C) C javob
D) D javob
JAVOB: A
`;
}

function passageGroup({
    start,
    section,
}: {
    readonly start:
        number;
    readonly section:
        "SCIENTIFIC-TEXT" |
        "LITERARY-TEXT" |
        "GHAZAL";
}): string {
    const nested =
        Array.from(
            {
                length:
                    5,
            },
            (
                _value,
                index,
            ) => {
                const order =
                    start +
                    index;

                return `${order}. SAVOL: ${order}-savol
A) A javob
B) B javob
C) C javob
D) D javob
JAVOB: A
BALL: 1`;
            },
        ).join(
            "\n",
        );

    return `
SAVOL ${start}
TUR: PASSAGE-GROUP
BO‘LIM: ${section}
SARLAVHA: ${section}
KO‘RSATMA: Matnni o‘qing.
MATN:
1. Birinchi matn bloki.
2. Ikkinchi matn bloki.
ICHKI SAVOLLAR:
${nested}
`;
}

function shortAnswer(
    order:
        number,
): string {
    return `
SAVOL ${order}
TUR: SHORT-ANSWER
SAVOL: ${order}-savol
QABUL JAVOBLAR: JAVOB
TAQQOSLASH: NORMALIZED
BALL: 1
`;
}

function multipart(
    order:
        number,
): string {
    return `
SAVOL ${order}
TUR: MULTIPART
SAVOL: ${order}-savol
KONTEKST: Tahlil uchun matn.
UMUMIY BALL: 1
a) Birinchi qism
QABUL JAVOBLAR: A
TAQQOSLASH: NORMALIZED
BALL: 0.5
b) Ikkinchi qism
QABUL JAVOBLAR: B
TAQQOSLASH: NORMALIZED
BALL: 0.5
`;
}

function createDiagnosticDocument(): string {
    return `
TEST TURI: DIAGNOSTIKA
SARLAVHA: To‘liq diagnostika — test
TAVSIF: 45 ta topshiriq.
KO‘RSATMA: Barcha topshiriqlarni bajaring.
DAQIQA: 180
KIRISH: BEPUL
QIYINLIK: HARD
TOPSHIRIQLAR: 45
MAKSIMAL BALL: 100

${Array.from(
    {
        length:
            17,
    },
    (
        _value,
        index,
    ) =>
        mcq(
            index +
                1,
        ),
).join("\n")}

${passageGroup({
    start:
        18,
    section:
        "SCIENTIFIC-TEXT",
})}

${passageGroup({
    start:
        23,
    section:
        "LITERARY-TEXT",
})}

${passageGroup({
    start:
        28,
    section:
        "GHAZAL",
})}

SAVOL 33
TUR: MATCHING
SARLAVHA: 33–35-savollar
KO‘RSATMA: Moslashtiring.
SAVOL: Gaplarni izohlar bilan moslashtiring.
VARIANTLAR:
A) Birinchi
B) Ikkinchi
C) Uchinchi
D) To‘rtinchi
E) Beshinchi
F) Oltinchi
MOSLASHTIRISH:
33. Birinchi gap | JAVOB: A | BALL: 1
34. Ikkinchi gap | JAVOB: B | BALL: 1
35. Uchinchi gap | JAVOB: C | BALL: 1

${[36, 37, 38, 39]
    .map(
        shortAnswer,
    )
    .join(
        "\n",
    )}

${[40, 41, 42, 43, 44]
    .map(
        multipart,
    )
    .join(
        "\n",
    )}

SAVOL 45
TUR: ESSAY
SARLAVHA: ESSE
PROMPT: Vaziyat yuzasidan fikringizni yozing.
VAZIYAT: Reklamalarning foyda va zararini muhokama qiling.
MINIMAL SO‘Z: 200
TAVSIYA ETILGAN SO‘Z: 250
KIRISH TALABLARI:
- Kirish ikki-uch jumla bo‘lsin.
ASOSIY QISM TALABLARI:
- Asosiy qism kamida uch xatboshi bo‘lsin.
XULOSA TALABLARI:
- Fikrlarni umumlashtiring.
OGOHLANTIRISHLAR:
- Reja tuzilmaydi.
BALL: 24
`;
}

describe(
    "diagnostic DOCX draft import",
    () => {
        it(
            "keeps all 45 units separate and preserves the normalized 100-point scale",
            () => {
                const parsed =
                    parseDiagnosticDocxDocument(
                        createDiagnosticDocument(),
                    );

                expect(
                    parsed,
                ).not.toBeNull();

                if (!parsed) {
                    return;
                }

                expect(
                    parsed.confidence,
                ).toBe(
                    "high",
                );

                expect(
                    parsed.taskCount,
                ).toBe(
                    45,
                );

                expect(
                    parsed.maximumScore,
                ).toBe(
                    100,
                );

                const literatureQuestion =
                    parsed.questions.find(
                        (question) =>
                            question.type ===
                                "multiple-choice" &&
                            question.sourceOrder ===
                                13,
                    );

                expect(
                    literatureQuestion &&
                    "section" in
                        literatureQuestion
                        ? literatureQuestion.section
                        : null,
                ).toBe(
                    "literature",
                );

                const imported =
                    createAdminDiagnosticDraftImport(
                        parsed,
                    );

                const draft:
                    AdminTestDraft = {
                    version:
                        1,
                    id:
                        "diagnostic-draft-test",
                    status:
                        "draft",
                    source:
                        "docx-import",
                    metadata: {
                        title:
                            "Old title",
                        description:
                            "",
                        group:
                            "grammar",
                        category:
                            "",
                        topicSlug:
                            "",
                        slug:
                            "1",
                        format:
                            "standard",
                        difficulty:
                            "medium",
                        access:
                            "free",
                        estimatedMinutes:
                            30,
                        ...imported.metadata,
                    },
                    questions:
                        imported.questions,
                    audit: {
                        createdAt:
                            1,
                        updatedAt:
                            1,
                        createdBy:
                            null,
                        updatedBy:
                            null,
                    },
                };

                expect(
                    calculateAdminDraftTaskCount(
                        draft,
                    ),
                ).toBe(
                    45,
                );

                expect(
                    calculateAdminDraftMaximumScore(
                        draft,
                    ),
                ).toBe(
                    parsed.rawMaximumScore,
                );

                expect(
                    draft.metadata.diagnostic,
                ).toEqual({
                    taskCount:
                        45,
                    finalMaximumScore:
                        100,
                    rawMaximumScore:
                        parsed.rawMaximumScore,
                });

                const essay =
                    draft.questions.find(
                        (question) =>
                            question.type ===
                            "essay",
                    );

                expect(
                    essay?.type ===
                        "essay"
                        ? essay.requirements.recommendedWords
                        : null,
                ).toBe(
                    250,
                );

                expect(
                    essay?.type ===
                        "essay"
                        ? essay.requirements.introduction
                        : [],
                ).toEqual([
                    "Kirish ikki-uch jumla bo‘lsin.",
                ]);

                expect(
                    validateAdminTestDraft(
                        draft,
                    ).isValid,
                ).toBe(
                    true,
                );
            },
        );


        it(
            "imports a standalone 1–17 diagnostic MCQ section without requiring the other sections",
            () => {
                const partialDocument = `
TEST TURI: DIAGNOSTIKA
SARLAVHA: Diagnostika 1–17
TOPSHIRIQLAR: 17
MAKSIMAL BALL: 17
${Array.from(
    {
        length:
            17,
    },
    (
        _value,
        index,
    ) =>
        mcq(
            index +
                1,
        ),
).join("\n")}
`;

                const parsed =
                    parseDiagnosticDocxDocument(
                        partialDocument,
                    );

                expect(
                    parsed?.confidence,
                ).toBe(
                    "high",
                );
                expect(
                    parsed?.taskCount,
                ).toBe(
                    17,
                );
                expect(
                    parsed?.questions.every(
                        (question) =>
                            question.type ===
                            "multiple-choice",
                    ),
                ).toBe(
                    true,
                );

                const first =
                    parsed?.questions[0];

                expect(
                    first
                        ? createAdminDiagnosticQuestionImport(
                            first,
                        ).sourceOrder
                        : null,
                ).toBe(
                    1,
                );
            },
        );

        it(
            "imports a standalone question 45 essay section",
            () => {
                const parsed =
                    parseDiagnosticDocxDocument(`
TEST TURI: DIAGNOSTIKA
SARLAVHA: Diagnostika esse
TOPSHIRIQLAR: 1
MAKSIMAL BALL: 24

SAVOL 45
TUR: ESSAY
SARLAVHA: ESSE
PROMPT: Vaziyat yuzasidan fikringizni yozing.
VAZIYAT: Ta’limda texnologiyaning o‘rnini muhokama qiling.
MINIMAL SO‘Z: 200
TAVSIYA ETILGAN SO‘Z: 250
TAVSIYA ETILGAN XATBOSHI: 5
KIRISH TALABLARI: Kirish aniq bo‘lsin.
ASOSIY QISM TALABLARI: Ikki tomon yoritilsin.
XULOSA TALABLARI: Fikr umumlashtirilsin.
BALL: 24
`);

                expect(
                    parsed?.confidence,
                ).toBe(
                    "high",
                );
                expect(
                    parsed?.taskCount,
                ).toBe(
                    1,
                );

                const essay =
                    parsed?.questions[0];
                const importedEssay =
                    essay
                        ? createAdminDiagnosticQuestionImport(
                            essay,
                        )
                        : null;

                expect(
                    importedEssay?.type,
                ).toBe(
                    "essay",
                );
                expect(
                    importedEssay?.sourceOrder,
                ).toBe(
                    45,
                );
                expect(
                    importedEssay?.type ===
                        "essay"
                        ? importedEssay.maximumScore
                        : null,
                ).toBe(
                    24,
                );
            },
        );
    },
);
