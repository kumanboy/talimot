import { createHash, randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import {
    STUDENT_SESSION_COOKIE,
    verifyStudentSessionToken,
} from "@/features/auth/model/student-session";
import {
    calculateDiagnosticTestScore,
} from "@/features/national-certificate/model/diagnostic-test-scoring";
import type {
    DiagnosticAnswers,
} from "@/features/national-certificate/model/diagnostic-test-types";
import {
    createDiagnosticItemResultRows,
} from "@/features/national-certificate/server/create-diagnostic-item-result-rows";
import {
    getStudentNationalTest,
} from "@/features/national-certificate/server/get-published-national-test";
import {
    getStudentTestAccessByRoute,
} from "@/features/tests/server/get-test-access";
import { db } from "@/lib/database/db";
import { diagnosticAttemptItemResults } from "@/lib/database/schema/diagnostic-attempt-item-results";
import { diagnosticCertificates } from "@/lib/database/schema/diagnostic-certificates";
import { studentTestAttempts } from "@/lib/database/schema/student-test-attempts";
import { users } from "@/lib/database/schema/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CompleteInput = {
    attemptId?: unknown;
    testSlug?: unknown;
    answers?: unknown;
    essayScore?: unknown;
    durationSeconds?: unknown;
};

function cleanText(value: unknown, max: number): string | null {
    return typeof value === "string" && value.trim()
        ? value.trim().slice(0, max)
        : null;
}

function safeDuration(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed)
        ? Math.max(0, Math.min(24 * 60 * 60, Math.floor(parsed)))
        : 0;
}

function parseEssayScore(value: unknown): number | null | "invalid" {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 75) return "invalid";
    return Math.round(parsed * 100) / 100;
}

function isAnswers(value: unknown): value is DiagnosticAnswers {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getActiveUser(request: NextRequest) {
    const token = request.cookies.get(STUDENT_SESSION_COOKIE)?.value;
    const session = verifyStudentSessionToken(token);
    if (!session) return null;

    const [user] = await db
        .select({
            id: users.id,
            status: users.status,
            firstName: users.firstName,
            lastName: users.lastName,
            fatherName: users.fatherName,
        })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

    return user?.status === "active" ? user : null;
}

function createScopedAttemptId(userId: string, testId: string, clientAttemptId: string): string {
    const digest = createHash("sha256")
        .update(`${userId}\0${testId}\0${clientAttemptId}`)
        .digest("hex")
        .slice(0, 40);
    return `diag-${digest}`;
}

function createCertificateCode(attemptId: string, issuedAt: number): string {
    const date = new Date(issuedAt);
    const datePart = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("");
    const attemptPart = attemptId.replace(/[^a-zA-Z0-9]/g, "").slice(-12).toUpperCase().padStart(12, "0");
    return `TLM-DIAG-${datePart}-${attemptPart}`;
}

function rowToCertificate(
    row: typeof diagnosticCertificates.$inferSelect,
) {
    const testScore = Number(row.testScore) || 0;
    const essayScore = row.essayScore === null ? null : Number(row.essayScore);
    const finalScore = row.finalScore === null ? null : Number(row.finalScore);
    return {
        attemptId: row.attemptId,
        certificateId: row.certificateCode,
        issuedAt: row.issuedAt,
        owner: {
            firstName: row.firstName,
            lastName: row.lastName,
            fatherName: row.fatherName,
        },
        result: {
            testTitle: row.testTitle,
            subject: row.subject,
            testScore,
            essayScore,
            finalScore,
            grade: row.grade,
            score: finalScore ?? testScore,
            maximumScore: 75 as const,
            percentage: row.percentage === null ? 0 : Number(row.percentage),
            correctCount: Number(row.correctCount) || 0,
            incorrectCount: Number(row.incorrectCount) || 0,
            unansweredCount: Number(row.unansweredCount) || 0,
            pendingCount: 0,
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const user = await getActiveUser(request);
        if (!user) {
            return NextResponse.json({ error: "Hisobga kirish talab qilinadi." }, { status: 401 });
        }

        const body = await request.json() as CompleteInput;
        const clientAttemptId = cleanText(body.attemptId, 180) ?? randomUUID();
        const testSlug = cleanText(body.testSlug, 120);
        const essayScore = parseEssayScore(body.essayScore);

        if (!testSlug || !isAnswers(body.answers)) {
            return NextResponse.json({ error: "Diagnostika natijasi noto‘g‘ri." }, { status: 400 });
        }
        if (essayScore === "invalid") {
            return NextResponse.json({ error: "Esse natijasi 0 dan 75 gacha bo‘lishi kerak." }, { status: 400 });
        }

        const test = await getStudentNationalTest("diagnostika", testSlug);
        if (!test || test.kind !== "diagnostic") {
            return NextResponse.json({ error: "Diagnostika topilmadi." }, { status: 404 });
        }

        const href = `/tests/milliy-sertifikat/diagnostika/${testSlug}`;
        const access = await getStudentTestAccessByRoute(
            {
                group: "national-certificate",
                topicSlug: "diagnostika",
                testSlug,
                href,
            },
            user.id,
        );

        if (!access) {
            return NextResponse.json({ error: "Diagnostika topilmadi." }, { status: 404 });
        }
        if (!access.canAccess) {
            return NextResponse.json({ error: "Bu diagnostika uchun kirish huquqi mavjud emas." }, { status: 403 });
        }

        // Scope the retry/idempotency key to the authenticated user + published test.
        // The browser-provided value is never used directly as a database primary key.
        const attemptId = createScopedAttemptId(user.id, test.id, clientAttemptId);

        const [existing] = await db
            .select()
            .from(diagnosticCertificates)
            .where(
                and(
                    eq(diagnosticCertificates.userId, user.id),
                    eq(diagnosticCertificates.attemptId, attemptId),
                ),
            )
            .limit(1);

        if (existing) {
            const certificate = rowToCertificate(existing);
            const recalculated = calculateDiagnosticTestScore(test, body.answers, essayScore);

            // Never backfill item analytics for an already-issued certificate from a
            // later browser retry: the original answers were not persisted historically,
            // so a replayed request cannot be proven to match the issuance-time answers.
            // Keep historical item data absent rather than accepting forgeable analytics.

            // A normal retry carries the same answers. Still, keep all summary fields
            // authoritative to the immutable certificate already stored in the DB.
            const result = {
                ...recalculated,
                testScore: certificate.result.testScore,
                essayScore: certificate.result.essayScore,
                finalScore: certificate.result.finalScore,
                grade: certificate.result.grade,
                finalPercentage: certificate.result.finalScore === null
                    ? null
                    : certificate.result.percentage,
                score: certificate.result.score,
                maximumScore: 75 as const,
                percentage: certificate.result.percentage,
                correctCount: certificate.result.correctCount,
                incorrectCount: certificate.result.incorrectCount,
                unansweredCount: certificate.result.unansweredCount,
                pendingCount: 0,
            };

            return NextResponse.json({
                ok: true,
                attemptId,
                result,
                certificate,
            });
        }

        // Server-authoritative scoring: the browser sends only answers and optional previous essay score.
        const result = calculateDiagnosticTestScore(test, body.answers, essayScore);
        const now = Date.now();
        const certificateId = randomUUID();
        const certificateCode = createCertificateCode(attemptId, now);
        const displayPercentage = result.finalPercentage
            ?? result.percentage;
        const itemRows = createDiagnosticItemResultRows({
            attemptId,
            userId: user.id,
            test,
            answers: body.answers,
            result,
            completedAt: now,
        });

        await db.transaction(async (tx) => {
            await tx
                .insert(studentTestAttempts)
                .values({
                    id: attemptId,
                    userId: user.id,
                    testId: test.id,
                    title: test.title,
                    category: "Milliy sertifikat · Diagnostika",
                    href,
                    format: "diagnostic",
                    correctCount: result.correctCount,
                    incorrectCount: result.incorrectCount,
                    unansweredCount: result.unansweredCount,
                    needsReviewCount: 0,
                    percentage: Math.round(displayPercentage),
                    score: String(result.finalScore ?? result.testScore),
                    maximumScore: "75",
                    durationSeconds: safeDuration(body.durationSeconds),
                    completedAt: now,
                    createdAt: now,
                })
                .onConflictDoNothing({ target: studentTestAttempts.id });

            if (itemRows.length > 0) {
                await tx
                    .insert(diagnosticAttemptItemResults)
                    .values(itemRows)
                    .onConflictDoNothing();
            }

            await tx
                .insert(diagnosticCertificates)
                .values({
                    id: certificateId,
                    certificateCode,
                    userId: user.id,
                    attemptId,
                    testId: test.id,
                    testTitle: test.title,
                    subject: "Ona tili va adabiyot",
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fatherName: user.fatherName,
                    testScore: String(result.testScore),
                    essayScore: result.essayScore === null ? null : String(result.essayScore),
                    finalScore: result.finalScore === null ? null : String(result.finalScore),
                    percentage: String(displayPercentage),
                    grade: result.grade,
                    correctCount: result.correctCount,
                    incorrectCount: result.incorrectCount,
                    unansweredCount: result.unansweredCount,
                    issuedAt: now,
                    createdAt: now,
                })
                // A repeated/double finish request must not create a second certificate.
                .onConflictDoNothing();
        });

        const [savedCertificate] = await db
            .select()
            .from(diagnosticCertificates)
            .where(eq(diagnosticCertificates.attemptId, attemptId))
            .limit(1);

        if (!savedCertificate) {
            throw new Error("Certificate persistence failed.");
        }

        return NextResponse.json({
            ok: true,
            attemptId,
            result,
            certificate: rowToCertificate(savedCertificate),
        });
    } catch (error) {
        console.error("Diagnostic completion failed", error);
        return NextResponse.json({ error: "Diagnostikani yakunlab bo‘lmadi. Qayta urinib ko‘ring." }, { status: 500 });
    }
}
