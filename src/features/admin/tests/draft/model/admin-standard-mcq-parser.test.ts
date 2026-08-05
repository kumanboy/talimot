import {
    describe,
    expect,
    it,
} from "vitest";

import {
    normalizeAdminDocxLine,
    parseStandardMcqDocument,
} from "./admin-standard-mcq-parser";

describe(
    "admin standard MCQ DOCX parser",
    () => {
        it(
            "normalizes spaces and apostrophes",
            () => {
                expect(
                    normalizeAdminDocxLine(
                        "  D)\u00A0 ma’shuqa,  ro’yirost  ",
                    ),
                ).toBe(
                    "D) maʼshuqa, roʼyirost".replace(
                        /ʼ/g,
                        "ʻ",
                    ),
                );
            },
        );

        it(
            "recognizes numbered questions with and without spaces",
            () => {
                const result =
                    parseStandardMcqDocument(`
1. Birinchi savol?
A) Bir
B) Ikki
C) Uch
D) To‘rt

2.Ikkinchi savol?
A) Besh
B) Olti
C) Yetti
D) Sakkiz
                    `);

                expect(
                    result.questions,
                ).toHaveLength(
                    2,
                );

                expect(
                    result.questions[0]
                        ?.sourceNumber,
                ).toBe(
                    1,
                );

                expect(
                    result.questions[1]
                        ?.sourceNumber,
                ).toBe(
                    2,
                );
            },
        );

        it(
            "creates review confidence when the answer key is absent",
            () => {
                const result =
                    parseStandardMcqDocument(`
3.Imloviy jihatdan to‘g‘ri yozilgan qatorni toping.
A) mashaqqat
B) muassasa
C) tomorqa
D) tabobat
                    `);

                expect(
                    result.questions[0]
                        ?.confidence,
                ).toBe(
                    "review",
                );

                expect(
                    result.questions[0]
                        ?.options,
                ).toHaveLength(
                    4,
                );

                expect(
                    result.questions[0]
                        ?.correctOptionId,
                ).toBeNull();
            },
        );

        it(
            "detects an answer key and produces high confidence",
            () => {
                const result =
                    parseStandardMcqDocument(`
1. Savol matni
A) A javob
B) B javob
C) C javob
D) D javob

JAVOBLAR
1=C
                    `);

                expect(
                    result.answerKeyCount,
                ).toBe(
                    1,
                );

                expect(
                    result.questions[0]
                        ?.correctOptionId,
                ).toBe(
                    "C",
                );

                expect(
                    result.questions[0]
                        ?.confidence,
                ).toBe(
                    "high",
                );
            },
        );

        it(
            "marks incomplete options as invalid",
            () => {
                const result =
                    parseStandardMcqDocument(`
5. Savol matni
A) A javob
B) B javob
D) D javob
                    `);

                expect(
                    result.questions[0]
                        ?.confidence,
                ).toBe(
                    "invalid",
                );

                expect(
                    result.questions[0]
                        ?.issues,
                ).toContain(
                    "C varianti topilmadi.",
                );
            },
        );
    },
);
