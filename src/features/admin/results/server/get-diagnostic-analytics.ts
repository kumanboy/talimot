import "server-only";

import {
    and,
    asc,
    desc,
    eq,
    inArray,
} from "drizzle-orm";

import {
    calibrateRaschItems,
} from "@/features/admin/results/model/rasch-calibration";
import { db } from "@/lib/database/db";
import { adminTestDrafts } from "@/lib/database/schema/admin-test-drafts";
import { diagnosticAttemptItemResults } from "@/lib/database/schema/diagnostic-attempt-item-results";
import { diagnosticCertificates } from "@/lib/database/schema/diagnostic-certificates";
import { studentTestAttempts } from "@/lib/database/schema/student-test-attempts";

export interface AdminDiagnosticOption {
    readonly id: string;
    readonly title: string;
    readonly slug: string;
    readonly status: string;
    readonly updatedAt: number;
}

export interface AdminDiagnosticGradeBucket {
    readonly key: "A+" | "A" | "B+" | "B" | "C+" | "C" | "NC";
    readonly label: string;
    readonly count: number;
}

export interface AdminDiagnosticItemMetric {
    readonly itemKey: string;
    readonly respondentCount: number;
    readonly correctCount: number;
    readonly incorrectCount: number;
    readonly unansweredCount: number;
    readonly correctRate: number;
    readonly unansweredRate: number;
    readonly raschDifficulty: number;
    readonly standardError: number | null;
}

export interface AdminDiagnosticAnalytics {
    readonly diagnostics: readonly AdminDiagnosticOption[];
    readonly selectedDiagnostic: AdminDiagnosticOption | null;
    readonly totalAttempts: number;
    readonly totalUsers: number;
    readonly latestResultUsers: number;
    readonly noEssayUsers: number;
    readonly raschUsers: number;
    readonly raschItems: number;
    readonly raschConverged: boolean;
    readonly raschIterations: number;
    readonly gradeDistribution: readonly AdminDiagnosticGradeBucket[];
    readonly itemMetrics: readonly AdminDiagnosticItemMetric[];
    readonly hardestItems: readonly AdminDiagnosticItemMetric[];
    readonly easiestItems: readonly AdminDiagnosticItemMetric[];
}

const gradeOrder = [
    ["A+", "A+"],
    ["A", "A"],
    ["B+", "B+"],
    ["B", "B"],
    ["C+", "C+"],
    ["C", "C"],
    ["NC", "NC"],
] as const;

function itemOrderValue(itemKey: string): number {
    const match = /^(\d+)([a-z])?$/i.exec(itemKey.trim());
    if (!match) return Number.MAX_SAFE_INTEGER;

    const order = Number(match[1]);
    const suffix = match[2]?.toLowerCase();
    const suffixOffset = suffix
        ? Math.max(1, suffix.charCodeAt(0) - 96) / 100
        : 0;

    return order + suffixOffset;
}

async function listDiagnostics(): Promise<readonly AdminDiagnosticOption[]> {
    return db
        .select({
            id: adminTestDrafts.id,
            title: adminTestDrafts.title,
            slug: adminTestDrafts.slug,
            status: adminTestDrafts.status,
            updatedAt: adminTestDrafts.updatedAt,
        })
        .from(adminTestDrafts)
        .where(
            and(
                eq(adminTestDrafts.groupName, "national-certificate"),
                eq(adminTestDrafts.topicSlug, "diagnostika"),
                eq(adminTestDrafts.format, "diagnostic"),
            ),
        )
        .orderBy(desc(adminTestDrafts.updatedAt));
}

async function loadItemRowsForAttempts(
    testId: string,
    attemptIds: readonly string[],
) {
    const rows: Array<{
        attemptId: string;
        userId: string;
        itemKey: string;
        verdict: string;
        isCorrect: boolean;
    }> = [];

    // Keep PostgreSQL parameter counts predictable even for large cohorts.
    const chunkSize = 1000;
    for (let offset = 0; offset < attemptIds.length; offset += chunkSize) {
        const chunk = attemptIds.slice(offset, offset + chunkSize);
        if (chunk.length === 0) continue;

        const chunkRows = await db
            .select({
                attemptId: diagnosticAttemptItemResults.attemptId,
                userId: diagnosticAttemptItemResults.userId,
                itemKey: diagnosticAttemptItemResults.itemKey,
                verdict: diagnosticAttemptItemResults.verdict,
                isCorrect: diagnosticAttemptItemResults.isCorrect,
            })
            .from(diagnosticAttemptItemResults)
            .where(
                and(
                    eq(diagnosticAttemptItemResults.testId, testId),
                    inArray(diagnosticAttemptItemResults.attemptId, [...chunk]),
                ),
            );

        rows.push(...chunkRows);
    }

    return rows;
}

export async function getAdminDiagnosticAnalytics(
    requestedTestId?: string | null,
): Promise<AdminDiagnosticAnalytics> {
    const diagnostics = await listDiagnostics();
    const selectedDiagnostic =
        diagnostics.find((item) => item.id === requestedTestId) ??
        diagnostics[0] ??
        null;

    const empty: AdminDiagnosticAnalytics = {
        diagnostics,
        selectedDiagnostic,
        totalAttempts: 0,
        totalUsers: 0,
        latestResultUsers: 0,
        noEssayUsers: 0,
        raschUsers: 0,
        raschItems: 0,
        raschConverged: false,
        raschIterations: 0,
        gradeDistribution: gradeOrder.map(([key, label]) => ({ key, label, count: 0 })),
        itemMetrics: [],
        hardestItems: [],
        easiestItems: [],
    };

    if (!selectedDiagnostic) return empty;

    const attemptRows = await db
        .select({
            id: studentTestAttempts.id,
            userId: studentTestAttempts.userId,
            completedAt: studentTestAttempts.completedAt,
        })
        .from(studentTestAttempts)
        .where(
            and(
                eq(studentTestAttempts.testId, selectedDiagnostic.id),
                eq(studentTestAttempts.format, "diagnostic"),
            ),
        )
        .orderBy(asc(studentTestAttempts.completedAt));

    const uniqueUsers = new Set(attemptRows.map((attempt) => attempt.userId));

    // Grade distribution uses each user's latest certificate for this diagnostic.
    // This avoids one heavy re-taker dominating the user-level distribution.
    const certificateRows = await db
        .select({
            userId: diagnosticCertificates.userId,
            finalScore: diagnosticCertificates.finalScore,
            grade: diagnosticCertificates.grade,
            issuedAt: diagnosticCertificates.issuedAt,
        })
        .from(diagnosticCertificates)
        .where(eq(diagnosticCertificates.testId, selectedDiagnostic.id))
        .orderBy(desc(diagnosticCertificates.issuedAt));

    const latestCertificateByUser = new Map<string, (typeof certificateRows)[number]>();
    for (const certificate of certificateRows) {
        if (!latestCertificateByUser.has(certificate.userId)) {
            latestCertificateByUser.set(certificate.userId, certificate);
        }
    }

    const gradeCounts = new Map<string, number>();
    let noEssayUsers = 0;
    for (const certificate of latestCertificateByUser.values()) {
        if (certificate.finalScore === null) {
            noEssayUsers += 1;
            continue;
        }

        const bucket = certificate.grade ?? "NC";
        gradeCounts.set(bucket, (gradeCounts.get(bucket) ?? 0) + 1);
    }

    // Rasch/item analysis uses the earliest persisted item-level attempt per user.
    // Repeated practice therefore does not overweight one student, while users who
    // completed diagnostics before this feature was deployed can enter the sample
    // on their first later attempt that actually has item-level rows.
    const itemAttemptHeaders = await db
        .selectDistinct({
            attemptId: diagnosticAttemptItemResults.attemptId,
            userId: diagnosticAttemptItemResults.userId,
            completedAt: diagnosticAttemptItemResults.completedAt,
        })
        .from(diagnosticAttemptItemResults)
        .where(eq(diagnosticAttemptItemResults.testId, selectedDiagnostic.id))
        .orderBy(asc(diagnosticAttemptItemResults.completedAt));

    const firstItemAttemptByUser = new Map<string, string>();
    for (const itemAttempt of itemAttemptHeaders) {
        if (!firstItemAttemptByUser.has(itemAttempt.userId)) {
            firstItemAttemptByUser.set(itemAttempt.userId, itemAttempt.attemptId);
        }
    }

    const calibrationAttemptIds = [...firstItemAttemptByUser.values()];
    const itemRows = await loadItemRowsForAttempts(
        selectedDiagnostic.id,
        calibrationAttemptIds,
    );

    const calibration = calibrateRaschItems(
        itemRows.map((row) => ({
            personId: row.userId,
            itemKey: row.itemKey,
            isCorrect: row.isCorrect,
        })),
    );

    const verdictCounts = new Map<string, {
        correct: number;
        incorrect: number;
        unanswered: number;
    }>();

    for (const row of itemRows) {
        const counts = verdictCounts.get(row.itemKey) ?? {
            correct: 0,
            incorrect: 0,
            unanswered: 0,
        };

        if (row.verdict === "correct") counts.correct += 1;
        else if (row.verdict === "unanswered") counts.unanswered += 1;
        else counts.incorrect += 1;

        verdictCounts.set(row.itemKey, counts);
    }

    const itemMetrics = calibration.itemEstimates
        .map((estimate) => {
            const counts = verdictCounts.get(estimate.itemKey) ?? {
                correct: estimate.correctCount,
                incorrect: Math.max(0, estimate.respondentCount - estimate.correctCount),
                unanswered: 0,
            };

            return {
                itemKey: estimate.itemKey,
                respondentCount: estimate.respondentCount,
                correctCount: counts.correct,
                incorrectCount: counts.incorrect,
                unansweredCount: counts.unanswered,
                correctRate: estimate.correctRate,
                unansweredRate: estimate.respondentCount > 0
                    ? Math.round((counts.unanswered / estimate.respondentCount) * 10000) / 100
                    : 0,
                raschDifficulty: estimate.difficulty,
                standardError: estimate.standardError,
            } satisfies AdminDiagnosticItemMetric;
        })
        .sort((left, right) => itemOrderValue(left.itemKey) - itemOrderValue(right.itemKey));

    const byDifficulty = [...itemMetrics].sort(
        (left, right) => right.raschDifficulty - left.raschDifficulty,
    );

    return {
        diagnostics,
        selectedDiagnostic,
        totalAttempts: attemptRows.length,
        totalUsers: uniqueUsers.size,
        latestResultUsers: latestCertificateByUser.size,
        noEssayUsers,
        raschUsers: calibration.personCount,
        raschItems: calibration.itemCount,
        raschConverged: calibration.converged,
        raschIterations: calibration.iterations,
        gradeDistribution: gradeOrder.map(([key, label]) => ({
            key,
            label,
            count: gradeCounts.get(key) ?? 0,
        })),
        itemMetrics,
        hardestItems: byDifficulty.slice(0, 5),
        easiestItems: byDifficulty.slice(-5).reverse(),
    };
}
