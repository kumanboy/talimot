import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parseGhazalDocxDocument,
} from "./admin-ghazal-docx-parser";

describe(
    "admin ghazal DOCX parser",
    () => {
        it(
            "parses metadata, couplets, vocabulary and five MCQs",
            () => {
                const result =
                    parseGhazalDocxDocument(`
TEST TURI: G‘AZAL
SARLAVHA: Sinov g‘azali
MUALLIF: Alisher Navoiy
KO‘RSATMA: G‘azalni o‘qing.

G‘AZAL
1. Birinchi misra,
Ikkinchi misra.

2. Uchinchi misra,
To‘rtinchi misra.

LUG‘AT
1. kamand — arqon
2. ashk — ko‘z yosh

SAVOLLAR
1. Savol bir?
A) A1
B) B1
C) C1
D) D1

2. Savol ikki?
A) A2
B) B2
C) C2
D) D2

3. Savol uch?
A) A3
B) B3
C) C3
D) D3

4. Savol to‘rt?
A) A4
B) B4
C) C4
D) D4

5. Savol besh?
A) A5
B) B5
C) C5
D) D5

JAVOBLAR
1=A 2=B 3=C 4=D 5=A
                    `);

                expect(
                    result,
                ).not.toBeNull();

                expect(
                    result?.couplets,
                ).toHaveLength(
                    2,
                );

                expect(
                    result?.vocabulary,
                ).toHaveLength(
                    2,
                );

                expect(
                    result?.questions,
                ).toHaveLength(
                    5,
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
            "returns null for a normal MCQ document",
            () => {
                expect(
                    parseGhazalDocxDocument(`
1. Oddiy savol
A) A
B) B
C) C
D) D
                    `),
                ).toBeNull();
            },
        );

        it(
            "marks a document without couplets as invalid",
            () => {
                const result =
                    parseGhazalDocxDocument(`
TEST TURI: G‘AZAL
SARLAVHA: Sinov
MUALLIF: Muallif

SAVOLLAR
1. Savol
A) A
B) B
C) C
D) D
                    `);

                expect(
                    result?.confidence,
                ).toBe(
                    "invalid",
                );
            },
        );
    },
);
