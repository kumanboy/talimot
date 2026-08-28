import "server-only";

import { createHash } from "node:crypto";

import type {
    DiagnosticAnswers,
    DiagnosticQuestionScoreResult,
    DiagnosticTestDefinition,
    DiagnosticTestScoreResult,
} from "@/features/national-certificate/model/diagnostic-test-types";
import type {
    NewDiagnosticAttemptItemResultRow,
} from "@/lib/database/schema/diagnostic-attempt-item-results";

interface CreateRowsInput {
    readonly attemptId: string;
    readonly userId: string;
    readonly test: DiagnosticTestDefinition;
    readonly answers: DiagnosticAnswers;
    readonly result: DiagnosticTestScoreResult;
    readonly completedAt: number;
}

function deterministicItemResultId(
    attemptId: string,
    itemKey: string,
): string {
    const digest = createHash("sha256")
        .update(`${attemptId}\0${itemKey}`)
        .digest("hex")
        .slice(0, 40);

    return `diag-item-${digest}`;
}

function safeJsonAnswer(value: unknown, depth = 0): unknown | null {
    if (value === undefined || value === null) return null;

    if (typeof value === "string") {
        // Diagnostic responses are short answer tokens/text. Keep a bounded
        // issuance-time snapshot so a malicious request cannot bloat JSONB.
        return value.slice(0, 1000);
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (depth >= 2 || typeof value !== "object") return null;

    if (Array.isArray(value)) {
        return value.slice(0, 20).map((item) => safeJsonAnswer(item, depth + 1));
    }

    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
            .slice(0, 20)
            .map(([key, item]) => [key.slice(0, 120), safeJsonAnswer(item, depth + 1)]),
    );
}

function baseRow(
    input: CreateRowsInput,
    score: DiagnosticQuestionScoreResult,
    itemKey: string,
    answerPayload: unknown,
    partId: string | null,
    awardedScore: number,
    maximumScore: number,
    verdict: "correct" | "incorrect" | "unanswered",
): NewDiagnosticAttemptItemResultRow {
    return {
        id: deterministicItemResultId(input.attemptId, itemKey),
        attemptId: input.attemptId,
        userId: input.userId,
        testId: input.test.id,
        questionId: score.questionId,
        questionOrder: score.order,
        itemKey,
        partId,
        section: score.section,
        verdict,
        isCorrect: verdict === "correct",
        isAnswered: verdict !== "unanswered",
        awardedScore: String(awardedScore),
        maximumScore: String(maximumScore),
        answerPayload: safeJsonAnswer(answerPayload),
        completedAt: input.completedAt,
        createdAt: input.completedAt,
    };
}

/**
 * Flatten the trusted diagnostic score into one binary calibration row per
 * visible item. Multipart Q40–44 become 40a/40b ... 44a/44b, while Q33–35
 * matching items remain separate 33/34/35 rows. Q45 is intentionally absent
 * because it is display-only and not part of the scored test section.
 */
export function createDiagnosticItemResultRows(
    input: CreateRowsInput,
): NewDiagnosticAttemptItemResultRow[] {
    const scoreByQuestionId = new Map(
        input.result.questionResults.map((score) => [score.questionId, score] as const),
    );
    const rows: NewDiagnosticAttemptItemResultRow[] = [];

    for (const question of input.test.questions) {
        if (question.type === "essay") continue;

        if (question.type === "passage-group") {
            for (const item of question.questions) {
                const score = scoreByQuestionId.get(item.id);
                if (!score || score.verdict === "pending") continue;

                rows.push(
                    baseRow(
                        input,
                        score,
                        String(item.order),
                        input.answers[item.id],
                        null,
                        score.awardedScore,
                        score.maximumScore,
                        score.verdict,
                    ),
                );
            }
            continue;
        }

        if (question.type === "matching-group") {
            const groupAnswer = input.answers[question.id];
            const values =
                typeof groupAnswer === "object" && groupAnswer !== null
                    ? groupAnswer as Readonly<Record<string, string>>
                    : {};

            for (const item of question.items) {
                const score = scoreByQuestionId.get(item.id);
                if (!score || score.verdict === "pending") continue;

                rows.push(
                    baseRow(
                        input,
                        score,
                        String(item.order),
                        values[item.id],
                        null,
                        score.awardedScore,
                        score.maximumScore,
                        score.verdict,
                    ),
                );
            }
            continue;
        }

        const score = scoreByQuestionId.get(question.id);
        if (!score || score.verdict === "pending") continue;

        if (question.type === "multipart") {
            const multipartAnswer = input.answers[question.id];
            const values =
                typeof multipartAnswer === "object" && multipartAnswer !== null
                    ? multipartAnswer as Readonly<Record<string, string>>
                    : {};
            const partScores = new Map(
                (score.parts ?? []).map((part) => [part.partId, part] as const),
            );

            for (const part of question.parts) {
                const partScore = partScores.get(part.id);
                if (!partScore) continue;

                const itemKey = `${question.order}${part.label}`;
                rows.push(
                    baseRow(
                        input,
                        score,
                        itemKey,
                        values[part.id],
                        part.id,
                        partScore.awardedScore,
                        partScore.maximumScore,
                        partScore.verdict,
                    ),
                );
            }
            continue;
        }

        rows.push(
            baseRow(
                input,
                score,
                String(question.order),
                input.answers[question.id],
                null,
                score.awardedScore,
                score.maximumScore,
                score.verdict,
            ),
        );
    }

    return rows;
}
