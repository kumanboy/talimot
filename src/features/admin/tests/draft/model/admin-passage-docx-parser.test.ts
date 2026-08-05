import {
    describe,
    expect,
    it,
} from "vitest";

import {
    parsePassageDocxDocument,
} from "./admin-passage-docx-parser";

describe("admin passage DOCX parser", () => {
    it("parses scientific numbered sections and five questions", () => {
        const result = parsePassageDocxDocument(`
TEST TURI: ILMIY MATN
SARLAVHA: Merkuriy
KO‘RSATMA: Matnni o‘qing.
MATN
I. Birinchi ilmiy bo‘lim.
II. Ikkinchi ilmiy bo‘lim.
III. Uchinchi ilmiy bo‘lim.
IV. To‘rtinchi ilmiy bo‘lim.
SAVOLLAR
1. Birinchi savol?
A) A1
B) B1
C) C1
D) D1
2. Ikkinchi savol?
A) A2
B) B2
C) C2
D) D2
3. Uchinchi savol?
A) A3
B) B3
C) C3
D) D3
4. To‘rtinchi savol?
A) A4
B) B4
C) C4
D) D4
5. Beshinchi savol?
A) A5
B) B5
C) C5
D) D5
JAVOBLAR
1=A 2=B 3=C 4=D 5=A
        `);

        expect(result?.metadata.topic).toBe("scientific-text");
        expect(result?.passage).toHaveLength(4);
        expect(result?.questions).toHaveLength(5);
        expect(result?.confidence).toBe("high");
    });

    it("parses literary headings, paragraphs and dialogue", () => {
        const result = parsePassageDocxDocument(`
TEST TURI: BADIIY MATN
SARLAVHA: Tanho qayiq
MATN
[SARLAVHA] TANHO QAYIQ
[PARAGRAF] Kechki payt. Hovli kimsasiz.
[DIALOG] Orol bobo: Qo‘y, Qalimbet.
SAVOLLAR
1. Savol?
A) A
B) B
C) C
D) D
JAVOBLAR
1=C
        `);

        expect(result?.metadata.topic).toBe("literary-text");
        expect(result?.passage.map((block) => block.type)).toEqual([
            "heading",
            "paragraph",
            "dialogue",
        ]);
        expect(result?.passage[2]?.speaker).toBe("Orol bobo");
        expect(result?.confidence).toBe("review");
    });

    it("returns null for a normal MCQ-only document", () => {
        expect(parsePassageDocxDocument(`
1. Savol?
A) A
B) B
C) C
D) D
        `)).toBeNull();
    });
});
