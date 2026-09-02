import { describe, expect, it } from "vitest";

import { scoreMixedQuestion } from "./mixed-test-scoring";
import type { MixedMultipartQuestion } from "./mixed-test-types";
import { mixedTestOne } from "./tests/mixed-test-1";

const manualQuestion: MixedMultipartQuestion = {
    type: "multipart",
    id: "q44",
    order: 44,
    sourceOrder: 44,
    question: "Q44",
    parts: [
        {
            id: "a",
            label: "a",
            question: "A",
            acceptedAnswers: ["TOG'RI"],
            comparison: "normalized",
            score: 1,
        },
        {
            id: "b",
            label: "b",
            question: "B",
            acceptedAnswers: [],
            comparison: "manual-review",
            score: 0,
        },
    ],
    explanation: {
        audio: {
            src: "/q44.mp3",
        },
    },
    maximumScore: 1,
};

describe("mixed multipart manual review", () => {
    it("does not penalize question 44 b while a is correct", () => {
        const result = scoreMixedQuestion(manualQuestion, {
            a: "TOG'RI",
            b: "ISTALGAN ERKIN JAVOB",
        });

        expect(result.awardedScore).toBe(1);
        expect(result.maximumScore).toBe(1);
        expect(result.verdict).toBe("correct");
        expect(result.parts?.[1]?.verdict).toBe("needs-review");
    });

    it("still grades question 44 a normally", () => {
        const result = scoreMixedQuestion(manualQuestion, {
            a: "XATO",
            b: "ISTALGAN ERKIN JAVOB",
        });

        expect(result.awardedScore).toBe(0);
        expect(result.verdict).toBe("incorrect");
    });

    it("keeps one audio on multipart source questions 40-44", () => {
        const multipart = mixedTestOne.questions.filter(
            (question) => question.type === "multipart",
        );

        expect(multipart.map((question) => question.sourceOrder)).toEqual([
            40,
            41,
            42,
            43,
            44,
        ]);

        multipart.forEach((question) => {
            expect(question.explanation?.audio?.src).toBeTruthy();
            question.parts.forEach((part) => {
                expect(part.explanation?.audio?.src).toBeUndefined();
            });
        });

        const q44 = multipart.find((question) => question.sourceOrder === 44);
        expect(q44?.parts[1]?.comparison).toBe("manual-review");
        expect(q44?.parts[1]?.score).toBe(0);
    });
});
