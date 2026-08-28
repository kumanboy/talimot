import "server-only";

import { and, eq } from "drizzle-orm";

import { getActiveStudentUserId } from "@/features/auth/server/get-active-student-user";
import { db } from "@/lib/database/db";
import { diagnosticCertificates } from "@/lib/database/schema/diagnostic-certificates";
import { studentTestAttempts } from "@/lib/database/schema/student-test-attempts";

export type MyTestAttemptDetails = {
    readonly authenticated: boolean;
    readonly attempt: {
        readonly id: string;
        readonly testId: string;
        readonly title: string;
        readonly category: string;
        readonly href: string;
        readonly format: string | null;
        readonly correctCount: number;
        readonly incorrectCount: number;
        readonly unansweredCount: number;
        readonly percentage: number;
        readonly score: number | null;
        readonly maximumScore: number | null;
        readonly durationSeconds: number;
        readonly completedAt: number;
        readonly grade: string | null;
        readonly certificateCode: string | null;
    } | null;
};

function parseOptionalNumber(value: string | null): number | null {
    if (!value || !value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

export async function getMyTestAttempt(attemptId: string): Promise<MyTestAttemptDetails> {
    const userId = await getActiveStudentUserId();
    if (!userId) return { authenticated: false, attempt: null };

    const [attempt] = await db
        .select({
            id: studentTestAttempts.id,
            testId: studentTestAttempts.testId,
            title: studentTestAttempts.title,
            category: studentTestAttempts.category,
            href: studentTestAttempts.href,
            format: studentTestAttempts.format,
            correctCount: studentTestAttempts.correctCount,
            incorrectCount: studentTestAttempts.incorrectCount,
            unansweredCount: studentTestAttempts.unansweredCount,
            percentage: studentTestAttempts.percentage,
            score: studentTestAttempts.score,
            maximumScore: studentTestAttempts.maximumScore,
            durationSeconds: studentTestAttempts.durationSeconds,
            completedAt: studentTestAttempts.completedAt,
        })
        .from(studentTestAttempts)
        .where(
            and(
                eq(studentTestAttempts.id, attemptId),
                eq(studentTestAttempts.userId, userId),
            ),
        )
        .limit(1);

    if (!attempt) return { authenticated: true, attempt: null };

    const [certificate] = await db
        .select({
            grade: diagnosticCertificates.grade,
            certificateCode: diagnosticCertificates.certificateCode,
        })
        .from(diagnosticCertificates)
        .where(
            and(
                eq(diagnosticCertificates.attemptId, attempt.id),
                eq(diagnosticCertificates.userId, userId),
            ),
        )
        .limit(1);

    return {
        authenticated: true,
        attempt: {
            ...attempt,
            score: parseOptionalNumber(attempt.score),
            maximumScore: parseOptionalNumber(attempt.maximumScore),
            grade: certificate?.grade ?? null,
            certificateCode: certificate?.certificateCode ?? null,
        },
    };
}
