export interface RaschBinaryResponse {
    readonly personId: string;
    readonly itemKey: string;
    readonly isCorrect: boolean;
}

export interface RaschItemCalibration {
    readonly itemKey: string;
    readonly difficulty: number;
    readonly standardError: number | null;
    readonly respondentCount: number;
    readonly correctCount: number;
    readonly correctRate: number;
}

export interface RaschCalibrationResult {
    readonly itemEstimates: readonly RaschItemCalibration[];
    readonly personCount: number;
    readonly itemCount: number;
    readonly converged: boolean;
    readonly iterations: number;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

/**
 * TA’LIMOT diagnostic Rasch item-difficulty calibration.
 *
 * The reference analytics supplied for the project use the classic item-logit
 * transform of the observed p-value:
 *
 *   b = ln((1 - p) / p)
 *
 * where p is the proportion of users answering the item correctly. Therefore:
 * - positive b => harder item
 * - b around 0 => roughly 50% correct
 * - negative b => easier item
 *
 * This reproduces the reference graph semantics exactly (for example, about
 * 20% correct => b ≈ +1.39). A 0.5 continuity correction is used only for
 * all-correct/all-wrong items so the logit remains finite.
 *
 * Each person-item pair is deduplicated before aggregation. The admin loader
 * already selects one persisted diagnostic attempt per user, so repeat solving
 * does not overweight one student.
 */
export function calibrateRaschItems(
    input: readonly RaschBinaryResponse[],
): RaschCalibrationResult {
    const deduplicated = new Map<string, RaschBinaryResponse>();

    for (const response of input) {
        if (!response.personId || !response.itemKey) continue;
        deduplicated.set(`${response.personId}\0${response.itemKey}`, response);
    }

    const responses = [...deduplicated.values()];
    const personIds = new Set(responses.map((response) => response.personId));
    const itemRows = new Map<string, RaschBinaryResponse[]>();

    for (const response of responses) {
        const rows = itemRows.get(response.itemKey) ?? [];
        rows.push(response);
        itemRows.set(response.itemKey, rows);
    }

    const itemEstimates = [...itemRows.entries()].map(([itemKey, rows]) => {
        const respondentCount = rows.length;
        const correctCount = rows.reduce(
            (total, row) => total + (row.isCorrect ? 1 : 0),
            0,
        );

        if (respondentCount === 0) {
            return {
                itemKey,
                difficulty: 0,
                standardError: null,
                respondentCount: 0,
                correctCount: 0,
                correctRate: 0,
            } satisfies RaschItemCalibration;
        }

        const rawP = correctCount / respondentCount;
        const p = rawP <= 0 || rawP >= 1
            ? (correctCount + 0.5) / (respondentCount + 1)
            : rawP;
        const difficulty = Math.log((1 - p) / p);
        const standardError = Math.sqrt(
            1 / Math.max(correctCount, 0.5) +
            1 / Math.max(respondentCount - correctCount, 0.5),
        );

        return {
            itemKey,
            difficulty: round2(difficulty),
            standardError: round2(standardError),
            respondentCount,
            correctCount,
            correctRate: round2(rawP * 100),
        } satisfies RaschItemCalibration;
    });

    return {
        itemEstimates,
        personCount: personIds.size,
        itemCount: itemEstimates.length,
        converged: itemEstimates.length > 0,
        iterations: itemEstimates.length > 0 ? 1 : 0,
    };
}
