import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parseMixedDocxDocument,
} from "./admin-mixed-docx-parser";

describe("admin mixed DOCX parser", () => {
    it("parses all four mixed question types and calculates task count", () => {
        const result = parseMixedDocxDocument(`
TEST TURI: ARALASH
SARLAVHA: Aralash test — 1
TOPSHIRIQLAR: 6
MAKSIMAL BALL: 9.3

SAVOL 4
TUR: MULTIPLE-CHOICE
SAVOL: Ma’nodoshlik hosil qiluvchi qatorni toping.
BALL: 1.7
A) Birinchi
B) Ikkinchi
C) Uchinchi
D) To‘rtinchi
JAVOB: C

SAVOL 33
TUR: MATCHING
SARLAVHA: 33–35-savollar
KO‘RSATMA: Moslashtiring.
VARIANTLAR:
A) atov gap
B) umumlashgan gap
C) to‘liqsiz gap
D) ikki bosh bo‘lakli gap
E) noma’lum gap
F) kiritmali gap
MOSLASHTIRISH:
33. Birinchi gap | JAVOB: A | BALL: 1.7
34. Ikkinchi gap | JAVOB: C | BALL: 1.7
35. Uchinchi gap | JAVOB: F | BALL: 1.7

SAVOL 36
TUR: SHORT-ANSWER
SAVOL: Ma’nodosh so‘zni yozing.
MISOLLAR: tez orada; qadrdon o‘rtoqlar
QABUL JAVOBLAR: YAQIN
TAQQOSLASH: normalized
BALL: 1.7

SAVOL 40
TUR: MULTIPART
SAVOL: Gapni tahlil qiling.
KONTEKST: Sinov gap.
UMUMIY BALL: 0.8
a) Birinchi qism
QABUL JAVOBLAR: BIR
TAQQOSLASH: normalized
BALL: 0.4
b) Ikkinchi qism
QABUL JAVOBLAR: IKKI
TAQQOSLASH: normalized
BALL: 0.4
        `);

        expect(result).not.toBeNull();
        expect(result?.questions).toHaveLength(4);
        expect(result?.questions.map((question) => question.type)).toEqual([
            "multiple-choice",
            "matching",
            "short-answer",
            "multipart",
        ]);
        expect(result?.taskCount).toBe(6);
        expect(result?.maximumScore).toBe(9.3);
        expect(result?.confidence).toBe("high");

        const matching = result?.questions.find(
            (question) => question.type === "matching",
        );
        expect(matching?.type).toBe("matching");
        if (matching?.type === "matching") {
            expect(matching.choices.map((choice) => choice.id)).toEqual([
                "A", "B", "C", "D", "E", "F",
            ]);
            expect(matching.items.map((item) => item.sourceOrder)).toEqual([
                33, 34, 35,
            ]);
        }
    });


    it("parses legacy matching items when JAVOB and BALL are on separate lines", () => {
        const result = parseMixedDocxDocument(`
TEST TURI: ARALASH
SARLAVHA: 33–34–35 — legacy
TOPSHIRIQLAR: 3
MAKSIMAL BALL: 3

SAVOL 1
TUR: MATCHING
SAVOL: Moslashtiring.
VARIANTLAR:
A) Undalmali gap
B) Ajratilgan bo‘lakli gap
C) So‘z-gap
D) Atov gap
E) Shaxsi umumlashgan gap
F) To‘liqsiz gap
MOSLASHTIRISH:
33. Birinchi gap
JAVOB: A
BALL: 1
34. Ikkinchi gap
JAVOB: B
BALL: 1
35. Uchinchi gap
JAVOB: C
BALL: 1
        `);

        expect(result?.confidence).toBe("high");
        expect(result?.taskCount).toBe(3);
        const matching = result?.questions[0];
        expect(matching?.type).toBe("matching");
        if (matching?.type === "matching") {
            expect(matching.items.map((item) => item.prompt)).toEqual([
                "Birinchi gap",
                "Ikkinchi gap",
                "Uchinchi gap",
            ]);
            expect(matching.items.map((item) => item.correctChoiceId)).toEqual([
                "A",
                "B",
                "C",
            ]);
            expect(matching.items.map((item) => item.maximumScore)).toEqual([
                1,
                1,
                1,
            ]);
        }
    });


    it("preserves a literal semicolon in punctuation replacement answers", () => {
        const result = parseMixedDocxDocument(`
TEST TURI: ARALASH

SAVOL 37
TUR: SHORT-ANSWER
SAVOL: Xato tinish belgisini to‘g‘ri belgi bilan almashtiring.
QABUL JAVOBLAR: : -> ; | :->; | : → ;
TAQQOSLASH: normalized
BALL: 2.5
        `);

        const question = result?.questions[0];
        expect(question?.type).toBe("short-answer");

        if (question?.type === "short-answer") {
            expect(question.acceptedAnswers).toEqual([
                ": -> ;",
                ":->;",
                ": → ;",
            ]);
        }
    });

    it("returns null for a non-mixed document", () => {
        expect(parseMixedDocxDocument("1. Oddiy savol")).toBeNull();
    });

    it("marks incomplete matching data invalid", () => {
        const result = parseMixedDocxDocument(`
TEST TURI: ARALASH
SAVOL 33
TUR: MATCHING
MOSLASHTIRISH:
33. Gap | JAVOB: A | BALL: 1.7
        `);
        expect(result?.questions[0]?.confidence).toBe("invalid");
    });
    it("rejects duplicated or missing A–F matching choice ids", () => {
        const result = parseMixedDocxDocument(`
TEST TURI: ARALASH
SAVOL 33
TUR: MATCHING
VARIANTLAR:
A) atov gap
B) umumlashgan gap
C) to‘liqsiz gap
E) noma’lum gap
F) bir tarkibli gap
F) takrorlangan variant
MOSLASHTIRISH:
33. Birinchi gap | JAVOB: A | BALL: 1.7
34. Ikkinchi gap | JAVOB: C | BALL: 1.7
35. Uchinchi gap | JAVOB: F | BALL: 1.7
        `);

        expect(result?.questions[0]?.confidence).toBe("invalid");
        expect(result?.questions[0]?.issues.join(" ")).toContain("D");
        expect(result?.questions[0]?.issues.join(" ")).toContain("F");
    });

});
