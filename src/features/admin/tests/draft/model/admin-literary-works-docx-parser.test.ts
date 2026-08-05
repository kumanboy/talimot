import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parseLiteraryWorksDocxDocument,
} from "./admin-literary-works-docx-parser";

describe(
    "admin literary works DOCX parser",
    () => {
        it(
            "parses prompt, excerpt and five standard-five questions",
            () => {
                const result =
                    parseLiteraryWorksDocxDocument(`
TEST TURI: BADIIY ASARLAR
SARLAVHA: Badiiy asarlar — 1
TAVSIF: Adabiyot bo‘yicha 5 ta savol.
KO‘RSATMA: Savollarga javob bering.

SAVOLLAR

13.
PROMPT: She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.
PARCHA:
Mengiz yo ravzayi rizvonmudur bu?
Og‘iz yo g‘unchayi xandonmudur bu?
SAVOL: She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.
A) A javob
B) B javob
C) C javob
D) D javob

14. Ikkinchi savol?
A) A javob
B) B javob
C) C javob
D) D javob

15. Uchinchi savol?
A) A javob
B) B javob
C) C javob
D) D javob

16. To‘rtinchi savol?
A) A javob
B) B javob
C) C javob
D) D javob

17. Beshinchi savol?
A) A javob
B) B javob
C) C javob
D) D javob

JAVOBLAR
13=A 14=B 15=C 16=D 17=A
                    `);

                expect(
                    result,
                ).not.toBeNull();

                expect(
                    result?.questions,
                ).toHaveLength(
                    5,
                );

                expect(
                    result?.questions[0]
                        ?.prompt,
                ).toBe(
                    "She’riy parcha haqidagi to‘g‘ri hukmni aniqlang.",
                );

                expect(
                    result?.questions[0]
                        ?.excerpt,
                ).toHaveLength(
                    2,
                );

                expect(
                    result?.answerKeyCount,
                ).toBe(
                    5,
                );

                expect(
                    result?.confidence,
                ).toBe(
                    "high",
                );
            },
        );

        it(
            "returns null for an unrelated standard MCQ document",
            () => {
                expect(
                    parseLiteraryWorksDocxDocument(`
1. Oddiy savol?
A) A
B) B
C) C
D) D
                    `),
                ).toBeNull();
            },
        );

        it(
            "marks missing options as invalid",
            () => {
                const result =
                    parseLiteraryWorksDocxDocument(`
TEST TURI: BADIIY ASARLAR
SAVOLLAR
13. Savol?
A) A
B) B
D) D
JAVOBLAR
13=A
                    `);

                expect(
                    result?.questions[0]
                        ?.confidence,
                ).toBe(
                    "invalid",
                );
            },
        );
    },
);
