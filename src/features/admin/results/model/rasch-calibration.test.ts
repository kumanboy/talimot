import { describe, expect, it } from "vitest";

import { calibrateRaschItems } from "./rasch-calibration";

describe("calibrateRaschItems", () => {
    it("uses the reference p-value logit where lower correct rate means higher difficulty", () => {
        const responses = [
            { personId: "p1", itemKey: "1", isCorrect: true },
            { personId: "p1", itemKey: "2", isCorrect: false },
            { personId: "p2", itemKey: "1", isCorrect: true },
            { personId: "p2", itemKey: "2", isCorrect: false },
            { personId: "p3", itemKey: "1", isCorrect: true },
            { personId: "p3", itemKey: "2", isCorrect: true },
            { personId: "p4", itemKey: "1", isCorrect: true },
            { personId: "p4", itemKey: "2", isCorrect: false },
        ] as const;

        const result = calibrateRaschItems(responses);
        const easy = result.itemEstimates.find((item) => item.itemKey === "1");
        const hard = result.itemEstimates.find((item) => item.itemKey === "2");

        expect(easy).toBeDefined();
        expect(hard).toBeDefined();
        expect(hard!.difficulty).toBeGreaterThan(easy!.difficulty);
        expect(easy!.correctRate).toBe(100);
        expect(hard!.correctRate).toBe(25);
        expect(hard!.difficulty).toBeCloseTo(1.1, 1);
    });

    it("matches the supplied reference example near 20 percent correct", () => {
        const responses = Array.from({ length: 1300 }, (_, index) => ({
            personId: `p${index + 1}`,
            itemKey: "3",
            isCorrect: index < 259,
        }));

        const result = calibrateRaschItems(responses);
        expect(result.itemEstimates[0]?.difficulty).toBe(1.39);
        expect(result.itemEstimates[0]?.correctCount).toBe(259);
    });

    it("deduplicates repeated person-item observations", () => {
        const result = calibrateRaschItems([
            { personId: "p1", itemKey: "1", isCorrect: false },
            { personId: "p1", itemKey: "1", isCorrect: true },
            { personId: "p2", itemKey: "1", isCorrect: false },
        ]);

        expect(result.personCount).toBe(2);
        expect(result.itemEstimates[0]?.respondentCount).toBe(2);
        expect(result.itemEstimates[0]?.correctCount).toBe(1);
    });
});
